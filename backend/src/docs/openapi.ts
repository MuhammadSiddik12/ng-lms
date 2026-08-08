export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "NG LMS API",
    version: "1.0.0",
    description:
      "Progressive student learning dashboard API — auth, aggregates, lessons, activity events, recommendations, CSV export, and mentor oversight.",
    contact: {
      name: "NG LMS",
    },
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Local development",
    },
  ],
  tags: [
    { name: "Health", description: "Service health" },
    { name: "Auth", description: "Registration and JWT authentication" },
    { name: "Dashboard", description: "Student KPIs and chart aggregates" },
    { name: "Courses", description: "Course catalog and enrollments" },
    { name: "Lessons", description: "Lesson details and progress" },
    { name: "Activities", description: "Learning activity events" },
    { name: "Recommendations", description: "Adaptive next steps" },
    { name: "Export", description: "Data export" },
    { name: "Mentor", description: "Mentor student oversight" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Paste the JWT from `/api/auth/login` or `/api/auth/register`.",
      },
    },
    schemas: {
      ApiError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Validation failed" },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: { type: "string" },
                message: { type: "string" },
              },
            },
          },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string", format: "email" },
          name: { type: "string" },
          role: { type: "string", enum: ["student", "mentor"] },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      AuthData: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/User" },
          token: { type: "string" },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", minLength: 2, example: "Asha Student" },
          email: {
            type: "string",
            format: "email",
            example: "asha@example.com",
          },
          password: {
            type: "string",
            minLength: 8,
            example: "Secure123",
            description: "Must include a letter and a number",
          },
          role: {
            type: "string",
            enum: ["student", "mentor"],
            default: "student",
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "student@demo.com" },
          password: { type: "string", example: "Demo@12345" },
        },
      },
      CourseProgress: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          category: { type: "string" },
          totalLessons: { type: "integer" },
          completedLessons: { type: "integer" },
          progressPercent: { type: "integer" },
          timeSpentSeconds: { type: "integer" },
        },
      },
      DashboardSummary: {
        type: "object",
        properties: {
          completedLessons: { type: "integer" },
          inProgressLessons: { type: "integer" },
          totalLessons: { type: "integer" },
          timeSpentSeconds: { type: "integer" },
          timeSpentHours: { type: "number" },
          enrolledCourses: { type: "integer" },
          overallProgressPercent: { type: "integer" },
          courses: {
            type: "array",
            items: { $ref: "#/components/schemas/CourseProgress" },
          },
        },
      },
      TimeseriesPoint: {
        type: "object",
        properties: {
          date: { type: "string", format: "date", example: "2026-08-08" },
          durationSeconds: { type: "integer" },
          eventCount: { type: "integer" },
        },
      },
      DistributionSegment: {
        type: "object",
        properties: {
          key: { type: "string" },
          label: { type: "string" },
          value: { type: "integer" },
        },
      },
      CreateActivityRequest: {
        type: "object",
        required: ["eventType"],
        properties: {
          eventType: {
            type: "string",
            enum: [
              "lesson_started",
              "lesson_completed",
              "time_logged",
              "quiz_attempt",
            ],
          },
          lessonId: { type: "string", format: "uuid", nullable: true },
          courseId: { type: "string", format: "uuid", nullable: true },
          durationSeconds: {
            type: "integer",
            minimum: 0,
            maximum: 86400,
            default: 0,
            example: 600,
          },
          metadata: {
            type: "object",
            additionalProperties: true,
            nullable: true,
          },
        },
      },
      UpdateProgressRequest: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["not_started", "in_progress", "completed"],
          },
          timeSpentSeconds: { type: "integer", minimum: 0 },
          incrementSeconds: { type: "integer", minimum: 0 },
        },
      },
      Recommendation: {
        type: "object",
        properties: {
          id: { type: "string" },
          priority: { type: "string", enum: ["high", "medium", "low"] },
          title: { type: "string" },
          reason: { type: "string" },
          actionLabel: { type: "string" },
          href: { type: "string" },
          courseId: { type: "string", format: "uuid" },
          lessonId: { type: "string", format: "uuid" },
        },
      },
      MentorStudentSummary: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          assignedAt: { type: "string", format: "date-time" },
          completedLessons: { type: "integer" },
          totalLessons: { type: "integer" },
          overallProgressPercent: { type: "integer" },
          timeSpentSeconds: { type: "integer" },
          enrolledCourses: { type: "integer" },
          inProgressLessons: { type: "integer" },
        },
      },
    },
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        status: { type: "string", example: "ok" },
                        service: { type: "string", example: "nglms-api" },
                        timestamp: { type: "string", format: "date-time" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Registered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string" },
                    data: { $ref: "#/components/schemas/AuthData" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
          "409": {
            description: "Email already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
              example: {
                email: "student@demo.com",
                password: "Demo@12345",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Logged in successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string" },
                    data: { $ref: "#/components/schemas/AuthData" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Current authenticated user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Current user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        user: { $ref: "#/components/schemas/User" },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
        },
      },
    },
    "/api/dashboard/summary": {
      get: {
        tags: ["Dashboard"],
        summary: "Student dashboard summary",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Dashboard summary",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: { $ref: "#/components/schemas/DashboardSummary" },
                  },
                },
              },
            },
          },
          "403": {
            description: "Students only",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
        },
      },
    },
    "/api/dashboard/timeseries": {
      get: {
        tags: ["Dashboard"],
        summary: "Daily time-spent series",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "days",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 90, default: 14 },
          },
        ],
        responses: {
          "200": {
            description: "Timeseries data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        days: { type: "integer" },
                        series: {
                          type: "array",
                          items: { $ref: "#/components/schemas/TimeseriesPoint" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/dashboard/distribution": {
      get: {
        tags: ["Dashboard"],
        summary: "Donut chart distribution",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "by",
            in: "query",
            schema: {
              type: "string",
              enum: ["status", "category"],
              default: "status",
            },
          },
        ],
        responses: {
          "200": {
            description: "Distribution segments",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        by: { type: "string" },
                        segments: {
                          type: "array",
                          items: {
                            $ref: "#/components/schemas/DistributionSegment",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/courses": {
      get: {
        tags: ["Courses"],
        summary: "List courses",
        description:
          "Students receive enrolled courses with progress. Mentors receive the full catalog.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Course list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        courses: { type: "array", items: { type: "object" } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/courses/{id}": {
      get: {
        tags: ["Courses"],
        summary: "Course detail with lessons",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Course detail" },
          "403": { description: "Not enrolled" },
          "404": { description: "Course not found" },
        },
      },
    },
    "/api/lessons/{id}": {
      get: {
        tags: ["Lessons"],
        summary: "Lesson detail",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Lesson detail with progress" },
          "404": { description: "Lesson not found" },
        },
      },
    },
    "/api/lessons/{id}/progress": {
      patch: {
        tags: ["Lessons"],
        summary: "Update lesson progress",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateProgressRequest" },
              examples: {
                complete: {
                  summary: "Mark complete",
                  value: { status: "completed" },
                },
                inProgress: {
                  summary: "Start lesson",
                  value: { status: "in_progress" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Progress updated" },
          "403": { description: "Students only / not enrolled" },
        },
      },
    },
    "/api/activities": {
      post: {
        tags: ["Activities"],
        summary: "Log an activity event",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateActivityRequest" },
              example: {
                lessonId: "00000000-0000-4000-8000-000000000001",
                eventType: "time_logged",
                durationSeconds: 600,
              },
            },
          },
        },
        responses: {
          "201": { description: "Activity logged" },
          "403": { description: "Students only" },
        },
      },
    },
    "/api/recommendations": {
      get: {
        tags: ["Recommendations"],
        summary: "Adaptive next-step recommendations",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Recommendation list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        recommendations: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Recommendation" },
                        },
                        generatedAt: { type: "string", format: "date-time" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/export/progress.csv": {
      get: {
        tags: ["Export"],
        summary: "Export lesson progress as CSV",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "CSV file",
            content: {
              "text/csv": {
                schema: { type: "string", format: "binary" },
              },
            },
          },
        },
      },
    },
    "/api/mentor/students": {
      get: {
        tags: ["Mentor"],
        summary: "List assigned students",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Assigned students with summaries",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        students: {
                          type: "array",
                          items: {
                            $ref: "#/components/schemas/MentorStudentSummary",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "403": { description: "Mentors only" },
        },
      },
    },
    "/api/mentor/students/{id}/dashboard": {
      get: {
        tags: ["Mentor"],
        summary: "Student dashboard for mentor view",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
          {
            name: "days",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 90, default: 14 },
          },
        ],
        responses: {
          "200": { description: "Student summary, timeseries, distribution" },
          "403": { description: "Student not assigned to mentor" },
          "404": { description: "Student not found" },
        },
      },
    },
  },
} as const;
