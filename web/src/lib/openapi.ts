/**
 * OpenAPI 3.1 description of the Safety Road GH public API.
 *
 * Hand-maintained rather than generated: the route handlers accept a few
 * legacy field aliases (e.g. `locationName`/`location`) that a generator would
 * miss, and the response bodies are reshaped from the Prisma rows before they
 * leave the handler. This document describes the shapes clients actually see.
 *
 * Served as JSON at /api/openapi.json and rendered by Swagger UI at /docs.
 */

const bearerAuth = [{ bearerAuth: [] as string[] }];

export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Safety Road GH API',
    version: '1.0.0',
    description:
      'Road accident and hazard reporting network for Ghana. Endpoints power the ' +
      'mobile app (reporting, hotspots, routing, emergency services) and the MTTD ' +
      'admin console. All routes are versioned under `/api/v1`.\n\n' +
      '**Authentication.** Obtain a JWT from `/api/v1/auth/login` or ' +
      '`/api/v1/auth/register`, then send it as `Authorization: Bearer <token>`. ' +
      'Use the **Authorize** button above to set it for the calls below.',
  },
  servers: [{ url: '/', description: 'This deployment' }],
  tags: [
    { name: 'Auth', description: 'Registration, login and the current profile.' },
    { name: 'Reports', description: 'Citizen accident and hazard reports.' },
    { name: 'Alerts', description: 'Operator road alerts (broadcast warnings).' },
    { name: 'Hotspots', description: 'Risk hotspots, derived and official.' },
    { name: 'Emergency Services', description: 'Directory and nearest-service lookup.' },
    { name: 'Safety Tips', description: 'Educational road-safety content.' },
    { name: 'Maps', description: 'Azure Maps proxies: search, reverse geocode, routing.' },
    { name: 'Releases', description: 'Latest published mobile build.' },
    { name: 'Upload', description: 'Image upload to Cloudinary.' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT issued by /api/v1/auth/login or /api/v1/auth/register.',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
          details: { type: 'string' },
        },
        required: ['error'],
      },
      Role: { type: 'string', enum: ['CITIZEN', 'RESPONDER', 'ADMIN'] },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          full_name: { type: 'string', example: 'Ama Mensah' },
          email: { type: 'string', format: 'email' },
          phone: { type: ['string', 'null'], example: '+233201234567' },
          role: { $ref: '#/components/schemas/Role' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          user: { $ref: '#/components/schemas/User' },
          token: { type: 'string', description: 'JWT, valid for 7 days.' },
        },
      },
      Report: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: { type: 'string', enum: ['ACCIDENT', 'HAZARD'] },
          hazardCategory: {
            type: 'string',
            description: 'Present on hazards only, e.g. POTHOLE, FLOOD, OTHER.',
          },
          title: { type: 'string' },
          description: { type: 'string' },
          injuredCount: { type: 'integer' },
          vehicleCount: { type: 'integer' },
          latitude: { type: 'number' },
          longitude: { type: 'number' },
          locationName: { type: 'string' },
          photoUrl: { type: ['string', 'null'] },
          status: {
            type: 'string',
            enum: ['PENDING', 'VERIFIED', 'RESPONDING', 'RESOLVED', 'REJECTED'],
          },
          createdAt: { type: 'string', format: 'date-time' },
          distanceM: {
            type: 'integer',
            description: 'Metres from the query point; only when lat/lng were supplied.',
          },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              phone: { type: ['string', 'null'] },
              email: { type: 'string' },
            },
          },
        },
      },
      CreateReportRequest: {
        type: 'object',
        required: ['type', 'description', 'latitude', 'longitude', 'locationName'],
        properties: {
          type: { type: 'string', enum: ['ACCIDENT', 'HAZARD'] },
          description: { type: 'string' },
          latitude: { type: 'number' },
          longitude: { type: 'number' },
          locationName: {
            type: 'string',
            description: 'Human-readable place. `location` is accepted as an alias.',
          },
          accident_type: {
            type: 'string',
            description: 'ACCIDENT only. Defaults to VEHICLE_COLLISION.',
            example: 'VEHICLE_COLLISION',
          },
          hazardCategory: {
            type: 'string',
            description: 'HAZARD only. Defaults to OTHER.',
            example: 'POTHOLE',
          },
          injuredCount: { type: 'integer', default: 0 },
          vehicleCount: { type: 'integer', default: 1 },
          photoUrl: {
            type: 'string',
            description: 'Image URL from /api/v1/upload. `image_url` is accepted as an alias.',
          },
        },
      },
      Alert: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          latitude: { type: ['number', 'null'] },
          longitude: { type: ['number', 'null'] },
          radius_km: { type: ['number', 'null'] },
          location: { type: ['string', 'null'] },
          active: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
          distanceM: {
            type: ['integer', 'null'],
            description: 'Distance from the query point (annotation only).',
          },
          local: { type: 'boolean', description: 'Concerns the queried area.' },
          networkWide: { type: 'boolean', description: 'No coordinate — relevant everywhere.' },
        },
      },
      Hotspot: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          latitude: { type: 'number' },
          longitude: { type: 'number' },
          radiusM: { type: 'integer' },
          riskScore: { type: 'number' },
          currentRisk: {
            type: 'number',
            description: 'Risk adjusted for the evaluated hour of day.',
          },
          severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          dominantType: { type: 'string' },
          incidentCount: { type: 'integer' },
          casualtyCount: { type: 'integer' },
          hourProfile: { type: 'array', items: { type: 'number' }, minItems: 24, maxItems: 24 },
          status: {
            type: 'string',
            enum: ['ACTIVE', 'MONITORING', 'UNDER_REPAIR', 'MITIGATED'],
          },
          source: { type: 'string', enum: ['DERIVED', 'OFFICIAL'] },
          notes: { type: ['string', 'null'] },
          lastIncidentAt: { type: ['string', 'null'], format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          distanceM: { type: 'integer', description: 'Only present on a circle (lat/lng/radiusM) query.' },
        },
      },
      EmergencyService: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string', example: 'HOSPITAL' },
          category: { type: 'string', description: 'Alias of `type`.' },
          phone: { type: 'string' },
          altPhone: { type: ['string', 'null'] },
          region: { type: ['string', 'null'] },
          address: { type: 'string' },
          latitude: { type: 'number' },
          longitude: { type: 'number' },
          distanceM: { type: 'integer', description: 'Nearest lookup only.' },
          etaMinutes: { type: 'integer', description: 'Nearest lookup only; estimate at ~35 km/h.' },
        },
      },
      SafetyTip: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          category: { type: 'string' },
          title: { type: 'string' },
          content: { type: 'string' },
          description: { type: 'string', description: 'Same value as `content`.' },
          imageUrl: { type: ['string', 'null'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['full_name', 'email', 'password'],
                properties: {
                  full_name: { type: 'string', description: '`name` is accepted as an alias.' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                  phone: { type: 'string' },
                  role: { $ref: '#/components/schemas/Role' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in and receive a JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'OK',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          503: { description: 'Login service temporarily unavailable' },
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get the current user profile',
        security: bearerAuth,
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { user: { $ref: '#/components/schemas/User' } },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Auth'],
        summary: 'Update the current profile or password',
        security: bearerAuth,
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  full_name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' },
                  currentPassword: {
                    type: 'string',
                    description: 'Required when setting newPassword.',
                  },
                  newPassword: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/v1/reports': {
      get: {
        tags: ['Reports'],
        summary: 'List accident and hazard reports',
        description:
          'Returns the national set, or — when lat/lng are supplied — reports within ' +
          '`radiusKm`, nearest first.',
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['ACCIDENT', 'HAZARD'] } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'lat', in: 'query', schema: { type: 'number' } },
          { name: 'lng', in: 'query', schema: { type: 'number' } },
          { name: 'radiusKm', in: 'query', schema: { type: 'number', default: 40 } },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    reports: { type: 'array', items: { $ref: '#/components/schemas/Report' } },
                    scoped: { type: 'boolean' },
                    radiusKm: { type: 'number' },
                  },
                },
              },
            },
          },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
      post: {
        tags: ['Reports'],
        summary: 'Submit a report',
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateReportRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { message: { type: 'string' }, report: { type: 'object' } },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/v1/reports/my': {
      get: {
        tags: ['Reports'],
        summary: "List the current user's reports",
        security: bearerAuth,
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    reports: { type: 'array', items: { $ref: '#/components/schemas/Report' } },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/v1/reports/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Reports'],
        summary: 'Get a single report',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { report: { $ref: '#/components/schemas/Report' } },
                },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Reports'],
        summary: 'Update a report status (admin or responder)',
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: { status: { type: 'string', example: 'VERIFIED' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'OK' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/v1/alerts': {
      get: {
        tags: ['Alerts'],
        summary: 'List active road alerts',
        description:
          'Every active alert is returned and annotated (local / networkWide / distance), ' +
          'local-first then nearest-first. `strict=true` hard-filters to local alerts only.',
        parameters: [
          { name: 'lat', in: 'query', schema: { type: 'number' } },
          { name: 'lng', in: 'query', schema: { type: 'number' } },
          { name: 'radiusKm', in: 'query', schema: { type: 'number', default: 40 } },
          { name: 'strict', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    alerts: { type: 'array', items: { $ref: '#/components/schemas/Alert' } },
                    scoped: { type: 'boolean' },
                    localCount: { type: 'integer' },
                  },
                },
              },
            },
          },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
      post: {
        tags: ['Alerts'],
        summary: 'Create a road alert (admin)',
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'description'],
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
                  latitude: { type: 'number' },
                  longitude: { type: 'number' },
                  radiusKm: {
                    type: 'number',
                    description: 'Broadcast radius, 1–500 km. Only stored alongside a coordinate.',
                  },
                  locationName: { type: 'string', description: '`location` accepted as an alias.' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Created' },
          400: { $ref: '#/components/responses/BadRequest' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/v1/hotspots': {
      get: {
        tags: ['Hotspots'],
        summary: 'List risk hotspots',
        description:
          'Filter by circle (lat/lng/radiusM) or viewport (minLat/maxLat/minLng/maxLng). ' +
          'Risk is evaluated at `hour` (defaults to the server hour).',
        parameters: [
          { name: 'lat', in: 'query', schema: { type: 'number' } },
          { name: 'lng', in: 'query', schema: { type: 'number' } },
          { name: 'radiusM', in: 'query', schema: { type: 'number' } },
          { name: 'minLat', in: 'query', schema: { type: 'number' } },
          { name: 'maxLat', in: 'query', schema: { type: 'number' } },
          { name: 'minLng', in: 'query', schema: { type: 'number' } },
          { name: 'maxLng', in: 'query', schema: { type: 'number' } },
          { name: 'hour', in: 'query', schema: { type: 'integer', minimum: 0, maximum: 23 } },
          {
            name: 'since',
            in: 'query',
            description: 'ISO timestamp; only hotspots updated since then (delta sync).',
            schema: { type: 'string', format: 'date-time' },
          },
          {
            name: 'includeInactive',
            in: 'query',
            description: 'Admin only — include MITIGATED hotspots.',
            schema: { type: 'boolean' },
          },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    hotspots: { type: 'array', items: { $ref: '#/components/schemas/Hotspot' } },
                    syncedAt: { type: 'string', format: 'date-time' },
                    evaluatedHour: { type: 'integer' },
                  },
                },
              },
            },
          },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
      post: {
        tags: ['Hotspots'],
        summary: 'Create an official hotspot (admin)',
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'latitude', 'longitude'],
                properties: {
                  name: { type: 'string' },
                  latitude: { type: 'number' },
                  longitude: { type: 'number' },
                  radiusM: { type: 'integer', default: 400 },
                  severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
                  dominantType: { type: 'string', example: 'ACCIDENT' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { hotspot: { $ref: '#/components/schemas/Hotspot' } },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/v1/hotspots/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      patch: {
        tags: ['Hotspots'],
        summary: 'Curate a hotspot (admin)',
        description: 'Status, notes, radius, and (official rows only) severity. Risk is not writable.',
        security: bearerAuth,
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['ACTIVE', 'MONITORING', 'UNDER_REPAIR', 'MITIGATED'],
                  },
                  notes: { type: 'string' },
                  name: { type: 'string' },
                  radiusM: { type: 'integer', minimum: 100, maximum: 5000 },
                  severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'OK' },
          400: { $ref: '#/components/responses/BadRequest' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Hotspots'],
        summary: 'Delete an official hotspot (admin)',
        description: 'Derived hotspots cannot be deleted — mark them MITIGATED instead (409).',
        security: bearerAuth,
        responses: {
          200: { description: 'Deleted' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { description: 'Derived hotspot — cannot be deleted' },
        },
      },
    },
    '/api/v1/hotspots/recompute': {
      post: {
        tags: ['Hotspots'],
        summary: 'Rebuild derived hotspots (admin)',
        description: 'Recomputes all DERIVED hotspots from incidents; OFFICIAL rows are untouched.',
        security: bearerAuth,
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    incidentsProcessed: { type: 'integer' },
                    hotspotsCreated: { type: 'integer' },
                    statusPreserved: { type: 'integer' },
                  },
                },
              },
            },
          },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/v1/emergency-services': {
      get: {
        tags: ['Emergency Services'],
        summary: 'List emergency services',
        parameters: [
          {
            name: 'type',
            in: 'query',
            description: '`category` accepted as an alias.',
            schema: { type: 'string', example: 'HOSPITAL' },
          },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    services: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/EmergencyService' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Emergency Services'],
        summary: 'Add an emergency service (admin)',
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'type', 'phone', 'latitude', 'longitude', 'address'],
                properties: {
                  name: { type: 'string' },
                  type: { type: 'string', description: '`category` accepted as an alias.' },
                  phone: { type: 'string' },
                  altPhone: { type: 'string' },
                  region: { type: 'string' },
                  address: { type: 'string' },
                  latitude: { type: 'number' },
                  longitude: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Created' },
          400: { $ref: '#/components/responses/BadRequest' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/v1/emergency-services/nearest': {
      get: {
        tags: ['Emergency Services'],
        summary: 'Find the nearest services',
        parameters: [
          { name: 'lat', in: 'query', required: true, schema: { type: 'number' } },
          { name: 'lng', in: 'query', required: true, schema: { type: 'number' } },
          { name: 'type', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 5, minimum: 1, maximum: 20 } },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    services: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/EmergencyService' },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/api/v1/safety-tips': {
      get: {
        tags: ['Safety Tips'],
        summary: 'List safety tips',
        parameters: [{ name: 'category', in: 'query', schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    tips: { type: 'array', items: { $ref: '#/components/schemas/SafetyTip' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Safety Tips'],
        summary: 'Create a safety tip (admin)',
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['category', 'title'],
                properties: {
                  category: { type: 'string' },
                  title: { type: 'string' },
                  description: {
                    type: 'string',
                    description: 'Body text. `content` accepted as an alias.',
                  },
                  image_url: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Created' },
          400: { $ref: '#/components/responses/BadRequest' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/v1/maps/search': {
      get: {
        tags: ['Maps'],
        summary: 'Geocode a place name (Ghana-biased)',
        parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    results: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          address: { type: 'string' },
                          municipality: { type: 'string' },
                          latitude: { type: 'number' },
                          longitude: { type: 'number' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          503: { description: 'AZURE_MAPS_KEY not configured' },
        },
      },
    },
    '/api/v1/maps/reverse': {
      get: {
        tags: ['Maps'],
        summary: 'Reverse geocode to an area name',
        parameters: [
          { name: 'lat', in: 'query', required: true, schema: { type: 'number' } },
          { name: 'lng', in: 'query', required: true, schema: { type: 'number' } },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: ['string', 'null'] },
                    region: { type: ['string', 'null'] },
                    label: { type: ['string', 'null'] },
                    latitude: { type: 'number' },
                    longitude: { type: 'number' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          503: { description: 'AZURE_MAPS_KEY not configured' },
        },
      },
    },
    '/api/v1/maps/route': {
      get: {
        tags: ['Maps'],
        summary: 'Plan a route and list hotspots along it',
        parameters: [
          { name: 'fromLat', in: 'query', required: true, schema: { type: 'number' } },
          { name: 'fromLng', in: 'query', required: true, schema: { type: 'number' } },
          { name: 'toLat', in: 'query', required: true, schema: { type: 'number' } },
          { name: 'toLng', in: 'query', required: true, schema: { type: 'number' } },
          { name: 'travelMode', in: 'query', schema: { type: 'string', default: 'car' } },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    route: {
                      type: 'object',
                      properties: {
                        distanceM: { type: ['integer', 'null'] },
                        durationS: { type: ['integer', 'null'] },
                        trafficDelayS: { type: 'integer' },
                        points: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              latitude: { type: 'number' },
                              longitude: { type: 'number' },
                            },
                          },
                        },
                      },
                    },
                    hotspots: { type: 'array', items: { $ref: '#/components/schemas/Hotspot' } },
                    riskSummary: {
                      type: 'object',
                      properties: {
                        count: { type: 'integer' },
                        highest: { type: 'number' },
                        criticalCount: { type: 'integer' },
                      },
                    },
                    evaluatedHour: { type: 'integer' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { description: 'No route found' },
          503: { description: 'AZURE_MAPS_KEY not configured' },
        },
      },
    },
    '/api/v1/releases/latest': {
      get: {
        tags: ['Releases'],
        summary: 'Latest published mobile build',
        responses: {
          200: {
            description: 'OK (available:false when no release exists)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    available: { type: 'boolean' },
                    version: { type: ['string', 'null'] },
                    name: { type: ['string', 'null'] },
                    publishedAt: { type: ['string', 'null'], format: 'date-time' },
                    releaseUrl: { type: 'string' },
                    apk: {
                      type: ['object', 'null'],
                      properties: {
                        url: { type: 'string' },
                        sizeMb: { type: 'number' },
                      },
                    },
                    pwaZip: {
                      type: ['object', 'null'],
                      properties: { url: { type: 'string' } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/upload': {
      post: {
        tags: ['Upload'],
        summary: 'Upload an image to Cloudinary',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: { file: { type: 'string', format: 'binary' } },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    url: { type: 'string' },
                    publicId: { type: 'string' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/ServerError' },
        },
      },
    },
  },
} as const;

// Reusable response objects. Declared after the document to keep the paths
// above readable; merged in here so the $ref targets resolve.
(openApiDocument.components as Record<string, unknown>).responses = {
  BadRequest: {
    description: 'Invalid request',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
  },
  Unauthorized: {
    description: 'Missing or invalid token',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
  },
  Forbidden: {
    description: 'Insufficient role',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
  },
  NotFound: {
    description: 'Not found',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
  },
  ServerError: {
    description: 'Server error',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
  },
};
