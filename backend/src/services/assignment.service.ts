
import sql from "mssql";
import getPool from "../config/db";
import {
  Assignment,
  AssignmentCreateInput,
  AssignmentRecipient,
  AssignmentRecipientUpdateInput,
  PaginatedAssignmentsResponse,
} from "../models/assignment.model";
import { sendTrainingAssignmentEmail } from "../config/mailer";

export class AssignmentService {
  async create(
    input: AssignmentCreateInput
  ): Promise<{ assignmentId: number; recipientsCount: number }> {
    // --- Normalize input to avoid invalid values (avoid Invalid Date / NaN)
    if (
      !input.notes ||
      (typeof input.notes === "string" && input.notes.trim() === "")
    )
      input.notes = null as any;

    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    let transactionStarted = false;

    try {
      await transaction.begin();
      transactionStarted = true;

      // Get training details for email
      const trainingResult = await new sql.Request(transaction)
        .input("trainingId", sql.Int, input.trainingId)
        .query(`
          SELECT t.*, tr.id as trainer_id, tr.trainerName as trainer_name, tr.trainerType as trainer_type,
                 v.name as venue_name
          FROM trainings t
          LEFT JOIN trainers tr ON t.trainerId = tr.id
          LEFT JOIN venues v ON t.venueId = v.id
          WHERE t.id = @trainingId
        `);

      if (!trainingResult || trainingResult.recordset.length === 0) {
        if (transactionStarted) await transaction.rollback();
        throw new Error("Training not found");
      }

      const training = trainingResult.recordset[0];

      // Create assignment
      const assignmentResult = await new sql.Request(transaction)
        .input("trainingId", sql.Int, input.trainingId)
        .input("assigneeType", sql.NVarChar, input.assigneeType)
        .input("assigneeId", sql.NVarChar, input.assigneeId || null)
        .input("assignedBy", sql.Int, input.assignedBy)
        .query(`
          INSERT INTO assignments (trainingId, assigneeType, assigneeId, assignedBy)
          OUTPUT INSERTED.id
          VALUES (@trainingId, @assigneeType, @assigneeId, @assignedBy)
        `);

      const assignmentId = assignmentResult.recordset[0].id;

      // Determine recipients based on assigneeType
      let recipientsQuery = "";
      let recipientsRequest = new sql.Request(transaction);

      switch (input.assigneeType) {
        case "individual": {
          if (!input.assigneeId) {
            await transaction.rollback();
            throw new Error("assigneeId required for individual assignment");
          }
          const assigneeNumber = Number(input.assigneeId);
          if (isNaN(assigneeNumber)) {
            await transaction.rollback();
            throw new Error("Invalid assigneeId for individual assignment");
          }
          recipientsQuery =
            "SELECT * FROM users WHERE id = @assigneeId AND status = 'active'";
          recipientsRequest.input("assigneeId", sql.Int, assigneeNumber);
          break;
        }

        // case 'grade':
        // case 'level': {
        //   if (!input.assigneeId) {
        //     await transaction.rollback();
        //     throw new Error('assigneeId required for grade/level assignment');
        //   }
        //   const field = input.assigneeType === 'grade' ? 'grade' : 'level';
        //   recipientsQuery = `SELECT * FROM users WHERE ${field} = ${input.assigneeId} AND status = 'active'`;
        //   recipientsRequest.input('assigneeId', sql.NVarChar, input.assigneeId);
        //   break;
        // }
        case "grade":
        case "level": {
          if (!input.assigneeId) {
            await transaction.rollback();
            throw new Error("assigneeId required for grade/level assignment");
          }

          const field = input.assigneeType === "grade" ? "grade" : "level";

          recipientsQuery = `SELECT * FROM users WHERE ${field} = @assigneeId AND status = 'active'`;

          recipientsRequest.input("assigneeId", sql.NVarChar, input.assigneeId);
          break;
        }

        case "position": {
          if (!input.assigneeId) {
            await transaction.rollback();
            throw new Error("assigneeId required for position assignment");
          }
          const assigneeNumber = Number(input.assigneeId);
          if (isNaN(assigneeNumber)) {
            await transaction.rollback();
            throw new Error("Invalid assigneeId for position assignment");
          }
          recipientsQuery = `SELECT * FROM users WHERE positionId = @assigneeId AND status = 'active'`;
          recipientsRequest.input("assigneeId", sql.Int, assigneeNumber);
          break;
        }

        case "dmt": {
          if (!input.assigneeId) {
            await transaction.rollback();
            throw new Error("assigneeId required for DMT assignment");
          }
          const assigneeNumber = Number(input.assigneeId);
          if (isNaN(assigneeNumber)) {
            await transaction.rollback();
            throw new Error("Invalid assigneeId for DMT assignment");
          }
          recipientsQuery = `SELECT * FROM users WHERE dmtId = @assigneeId AND status = 'active'`; //
          recipientsRequest.input("assigneeId", sql.Int, assigneeNumber);
          break;
        }

        // case "function": {
        //   if (!input.assigneeId) {
        //     await transaction.rollback();
        //     throw new Error("assigneeId required for function assignment");
        //   }
        //   recipientsQuery = `SELECT * FROM users WHERE function = @assigneeId AND status = \'active\'`;
        //   recipientsRequest.input("assigneeId", sql.NVarChar, input.assigneeId);
        //   break;
        // }

        case "function": {
          if (!input.assigneeId) {
            await transaction.rollback();
            throw new Error("assigneeId required for function assignment");
          }

          recipientsQuery = `SELECT * FROM users WHERE [function] = @assigneeId AND status = 'active'`;

          recipientsRequest.input("assigneeId", sql.NVarChar, input.assigneeId);
          break;
        }

        default:
          await transaction.rollback();
          throw new Error("Invalid assigneeType");
      }
      // console.log("recipientsQuery", recipientsQuery);

      const recipientsResult = await recipientsRequest.query(recipientsQuery);
      // console.log("recipientsResult", recipientsResult);
      const recipients = recipientsResult.recordset;

      if (!recipients || recipients.length === 0) {
        await transaction.rollback();
        throw new Error("No recipients found for the specified criteria");
      }

      // Create assignment recipients (inside transaction)
      for (const recipient of recipients) {
        await new sql.Request(transaction)
          .input("assignmentId", sql.Int, assignmentId)
          .input("userId", sql.Int, recipient.id)
          .input("notes", sql.NVarChar, input.notes || null).query(`
            INSERT INTO assignment_recipients 
            (assignmentId, userId, notes)
            VALUES 
            (@assignmentId, @userId, @notes)
          `);
      }

      // commit transaction before sending emails
      await transaction.commit();
      transactionStarted = false; // committed, so don't rollback in catch

      // Send email notifications AFTER commit (so we don't hold transaction while sending)
      for (const recipient of recipients) {
        try {
          const startDateRaw = training.trainingStartDate;
          const endDateRaw = training.trainingEndDate;

          const dateText = startDateRaw
            ? endDateRaw
              ? `${new Date(startDateRaw).toLocaleDateString()} - ${new Date(endDateRaw).toLocaleDateString()}`
              : new Date(startDateRaw).toLocaleDateString()
            : "TBD";

          const timeText = startDateRaw
            ? endDateRaw
              ? `${new Date(startDateRaw).toLocaleTimeString()} - ${new Date(endDateRaw).toLocaleTimeString()}`
              : new Date(startDateRaw).toLocaleTimeString()
            : "TBD";

          await sendTrainingAssignmentEmail({
            to: recipient.email,
            trainingTopic: training.topic,
            venue: training.venue_name || "TBD",
            date: dateText,
            time: timeText,
            trainer: training.trainer_name || "TBD",
          });
        } catch (emailError) {
          // log and continue — don't undo DB changes because email failed
          console.error(
            `Failed to send email to ${recipient.email}:`,
            emailError
          );
        }
      }

      return {
        assignmentId,
        recipientsCount: recipients.length,
      };
    } catch (error: any) {
      // rollback only if transaction actually started and wasn't committed
      try {
        if (transactionStarted) {
          await transaction.rollback();
          transactionStarted = false;
        }
      } catch (rbErr) {
        console.error("Rollback error:", rbErr);
      }
      // rethrow the original error (so controller returns 500 with message)
      throw error;
    }
  }

  async findAll(params?: {
    userId?: number;
    trainingId?: number;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedAssignmentsResponse> {
    const pool = await getPool();
    let request = pool.request();

    // Set default pagination values
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    
    if (params?.userId) {
      whereClause += ` AND EXISTS (
        SELECT 1 FROM assignment_recipients ar 
        WHERE ar.assignmentId = a.id AND ar.userId = @userId
      )`;
      request.input("userId", sql.Int, params.userId);
    }

    if (params?.trainingId) {
      whereClause += ` AND a.trainingId = @trainingId`;
      request.input("trainingId", sql.Int, params.trainingId);
    }

    if (params?.status) {
      whereClause += ` AND EXISTS (
        SELECT 1 FROM assignment_recipients ar 
        WHERE ar.assignmentId = a.id AND ar.status = @status
      )`;
      request.input("status", sql.NVarChar, params.status);
    }

    // Get total count - optimized query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM assignments a
      ${whereClause ? 'WHERE ' + whereClause.replace('WHERE ', '') : ''}
    `;

    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;

    // Get paginated data - optimized query
    const dataQuery = `
      SELECT a.*, 
             t.topic, v.name as venue, t.trainingStartDate, t.trainingEndDate, tr.trainerName as trainer,
             u.firstName + ' ' + u.lastName as assignedByName,
             (SELECT COUNT(*) FROM assignment_recipients ar WHERE ar.assignmentId = a.id) as recipientCount
      FROM assignments a
      INNER JOIN trainings t ON a.trainingId = t.id
      LEFT JOIN venues v ON t.venueId = v.id
      LEFT JOIN trainers tr ON t.trainerId = tr.id
      LEFT JOIN users u ON a.assignedBy = u.id
      ${whereClause}
      ORDER BY a.createdAt DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    request.input("offset", sql.Int, offset);
    request.input("limit", sql.Int, limit);

    const dataResult = await request.query(dataQuery);
    const assignments = dataResult.recordset;

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      assignments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  async getRecipients(assignmentId: number): Promise<AssignmentRecipient[]> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("assignmentId", sql.Int, assignmentId).query(`
        SELECT 
          ar.id, 
          ar.assignmentId, 
          ar.userId, 
          ar.status, 
          ar.attendance, 
          ar.completedDate, 
          ar.notes,
          u.staffId, 
          u.employeeId, 
          u.firstName, 
          u.lastName, 
          u.email,
          u.department, 
          u.[function] AS [function], 
          u.[level] AS [level], 
          u.grade
        FROM assignment_recipients ar
        INNER JOIN users u ON ar.userId = u.id
        WHERE ar.assignmentId = @assignmentId
        ORDER BY u.firstName, u.lastName
      `);

    return result.recordset;
  }

  async updateRecipientStatus(
    id: number,
    input: AssignmentRecipientUpdateInput
  ): Promise<AssignmentRecipient> {
    const pool = await getPool();
    let request = pool.request().input("id", sql.Int, id);

    const updates: string[] = [];
    if (input.status !== undefined) {
      updates.push("status = @status");
      request.input("status", sql.NVarChar, input.status);
    }
    if (input.notes !== undefined) {
      updates.push("notes = @notes");
      request.input("notes", sql.NVarChar, input.notes);
    }

    if (updates.length === 0) {
      throw new Error("No fields to update");
    }

    updates.push("updatedAt = SYSUTCDATETIME()");

    await request.query(
      `UPDATE assignment_recipients SET ${updates.join(", ")} WHERE id = @id`
    );

    const result = await pool.request().input("id", sql.Int, id).query(`
        SELECT ar.*,
               u.firstName + ' ' + u.lastName as userName,
               t.topic as trainingTopic
        FROM assignment_recipients ar
        INNER JOIN users u ON ar.userId = u.id
        INNER JOIN assignments a ON ar.assignmentId = a.id
        INNER JOIN trainings t ON a.trainingId = t.id
        WHERE ar.id = @id
      `);

    return result.recordset[0];
  }

  async isUserAssigner(recipientId: number, userId: number): Promise<boolean> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("recipientId", sql.Int, recipientId)
      .input("userId", sql.Int, userId).query(`
        SELECT a.assignedBy
        FROM assignment_recipients ar
        INNER JOIN assignments a ON ar.assignmentId = a.id
        WHERE ar.id = @recipientId AND a.assignedBy = @userId
      `);

    return result.recordset.length > 0;
  }

  async isUserRecipient(recipientId: number, userId: number): Promise<boolean> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("recipientId", sql.Int, recipientId)
      .input("userId", sql.Int, userId).query(`
        SELECT id
        FROM assignment_recipients
        WHERE id = @recipientId AND userId = @userId
      `);

    return result.recordset.length > 0;
  }

  async updateOwnStatus(
    id: number,
    status: string
  ): Promise<AssignmentRecipient> {
    const pool = await getPool();

    // Only allow updating status
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("status", sql.NVarChar, status)
      .query(`
        UPDATE assignment_recipients 
        SET status = @status, 
            updatedAt = SYSUTCDATETIME()
        WHERE id = @id
      `);

    const result = await pool.request().input("id", sql.Int, id).query(`
        SELECT ar.*,
               u.firstName + ' ' + u.lastName as userName,
               t.topic as trainingTopic
        FROM assignment_recipients ar
        INNER JOIN users u ON ar.userId = u.id
        INNER JOIN assignments a ON ar.assignmentId = a.id
        INNER JOIN trainings t ON a.trainingId = t.id
        WHERE ar.id = @id
      `);

    return result.recordset[0];
  }
}

export default new AssignmentService();
