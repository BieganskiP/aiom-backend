<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# All-in-One Manager API Documentation

This document provides comprehensive documentation for all API endpoints in the All-in-One Manager backend application.

## Authentication Endpoints

Base path: `/auth`

### POST /auth/signup

Create a new user account.

- Body: `CreateUserDto`
  - email: string
  - password: string
  - firstName: string
  - lastName: string
- Returns: User object and sets JWT cookie

### POST /auth/login

Authenticate user and get access token.

- Body:
  - email: string
  - password: string
- Returns: Access token and user details, sets JWT cookie

### POST /auth/logout

Logout user and clear authentication cookie.

- Returns: Success message

### GET /auth/profile

Get current user's profile (requires authentication).

- Returns: User profile details

### POST /auth/invite

Create invitation for new user (requires ADMIN role).

- Body:
  - email: string
- Returns: Invitation details

### POST /auth/reset-password-request

Request password reset.

- Body:
  - email: string
- Returns: Success message

### POST /auth/reset-password

Reset password using token.

- Body:
  - token: string
  - password: string
- Returns: Success message

### POST /auth/validate-invitation

Validate invitation token.

- Body:
  - token: string
- Returns: Invitation validation status

### POST /auth/complete-registration

Complete registration process with invitation.

- Body: CompleteRegistrationDto
- Returns: Access token and user details

## Files Endpoints

Base path: `/files`

### POST /files/upload/image

Upload an image file (max 5MB, jpg/jpeg/png).

- Body: Form data with 'file' field
- Returns: Uploaded file details

### POST /files/upload/pdf

Upload a PDF file (max 10MB).

- Body: Form data with 'file' field
- Returns: Uploaded file details

### GET /files

Get all files.

- Returns: Array of file objects

### GET /files/:id

Get file by ID.

- Returns: File details

### GET /files/:id/download

Download file by ID.

- Returns: File stream

### DELETE /files/:id

Delete file by ID.

- Returns: Success message

## Cars Endpoints

Base path: `/cars`

### POST /cars

Create new car (requires ADMIN role).

- Body: CreateCarDto
- Returns: Created car object

### GET /cars

Get all cars.

- Returns: Array of car objects

### GET /cars/:id

Get car by ID.

- Returns: Car details

### PATCH /cars/:id

Update car details (requires ADMIN role).

- Body: UpdateCarDto
- Returns: Updated car object

### PATCH /cars/:id/assign

Assign car to user/route (requires ADMIN role).

- Body: AssignCarDto
- Returns: Updated car object

### POST /cars/:id/unassign

Unassign car (requires ADMIN role).

- Returns: Updated car object

### DELETE /cars/:id/soft

Soft delete car (requires ADMIN role).

- Returns: Success message

### DELETE /cars/:id

Hard delete car (requires ADMIN role).

- Returns: Success message

### PATCH /cars/:id/status

Update car status (requires ADMIN role).

- Body: UpdateCarStatusDto
- Returns: Updated car object

## Routes Endpoints

Base path: `/routes`

### POST /routes

Create new route (requires ADMIN role).

- Body: CreateRouteDto
- Returns: Created route object

### GET /routes

Get all routes.

- Returns: Array of route objects

### GET /routes/:id

Get route by ID.

- Returns: Route details

### PATCH /routes/:id

Update route (requires ADMIN role).

- Body: UpdateRouteDto
- Returns: Updated route object

### PATCH /routes/:id/assign

Assign route (requires ADMIN role).

- Body: AssignRouteDto
- Returns: Updated route object

### POST /routes/:id/unassign

Unassign route (requires ADMIN role).

- Returns: Updated route object

### DELETE /routes/:id/soft

Soft delete route (requires ADMIN role).

- Returns: Success message

### DELETE /routes/:id

Hard delete route (requires ADMIN role).

- Returns: Success message

## Work Entries Endpoints

Base path: `/work-entries`

### POST /work-entries

Create new work entry.

- Body: CreateWorkEntryDto
- Returns: Created work entry object

### GET /work-entries/my-entries

Get current user's work entries.

- Query Parameters:
  - month?: Date
  - userId?: string
  - routeId?: string
  - carId?: string
  - regionId?: string
  - startDate?: Date
  - endDate?: Date
- Returns: Array of work entries

### GET /work-entries

Get all work entries (requires ADMIN/OWNER/LEADER role).

- Query Parameters: Same as /my-entries
- Returns: Array of work entries

### PATCH /work-entries/:id

Update work entry.

- Body: UpdateWorkEntryDto
- Returns: Updated work entry object

### DELETE /work-entries/:id

Delete work entry.

- Returns: Success message

### GET /work-entries/financial-summary

Get financial summary (requires ADMIN/OWNER/LEADER role).

- Query Parameters: Same as /my-entries
- Returns: Financial summary data

## Regions Endpoints

Base path: `/regions`

### POST /regions

Create new region (requires ADMIN/OWNER role).

- Body: CreateRegionDto
- Returns: Created region object

### GET /regions

Get all regions.

- Returns: Array of region objects

### GET /regions/:id

Get region by ID.

- Returns: Region details

### PATCH /regions/:id

Update region (requires ADMIN/OWNER role).

- Body: UpdateRegionDto
- Returns: Updated region object

### DELETE /regions/:id

Delete region (requires ADMIN/OWNER role).

- Returns: Success message

### POST /regions/:id/routes

Add routes to region (requires ADMIN/OWNER role).

- Body:
  - routeIds: string[]
- Returns: Updated region object

### DELETE /regions/:id/routes/:routeId

Remove route from region (requires ADMIN/OWNER role).

- Returns: Updated region object

### GET /regions/:id/routes

Get routes in region (requires ADMIN/OWNER/LEADER role).

- Returns: Array of routes

## Complaints Endpoints

Base path: `/complaints`

### GET /complaints

Get all complaints (requires ADMIN/OWNER/LEADER role).

- Query Parameters: FindComplaintsDto
- Returns: Array of complaints

### GET /complaints/stats

Get complaints statistics (requires ADMIN/OWNER/LEADER role).

- Query Parameters: GetStatsDto
- Returns: Complaints statistics

### GET /complaints/:id

Get complaint by ID (requires ADMIN/OWNER/LEADER role).

- Returns: Complaint details

### PATCH /complaints/:id/assign/:userId

Assign complaint to user (requires ADMIN/OWNER role).

- Returns: Updated complaint object

### PATCH /complaints/:id/status

Update complaint status (requires ADMIN/OWNER role).

- Body: UpdateComplaintStatusDto
- Returns: Updated complaint object

### DELETE /complaints/:id

Delete complaint (requires ADMIN/OWNER role).

- Returns: Success message

## Authentication and Authorization

Most endpoints require authentication using JWT tokens. The token is automatically handled through HTTP-only cookies set during login/signup.

### User Roles

- ADMIN: Full access to all endpoints
- OWNER: Access to most management endpoints
- LEADER: Limited access to view and manage assigned regions
- USER: Basic access to personal endpoints

### Security Features

- JWT-based authentication
- Role-based access control
- HTTP-only cookies for token storage
- Secure password handling
- Input validation
- Rate limiting (if configured)
