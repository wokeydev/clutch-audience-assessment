# Clutch Assessment - NestJS Framework

This project is a NestJS-based application designed for the Clutch Assessment, including features for user sign-in and sign-up with Docker integration for PostgreSQL.

### Setting Up Environment Variables

1. **Create Environment Files**: Copy the provided example environment files.
   
   ```bash
   cp .env.example .env
2. Configure `.env`: Open the `.env` file and specify the required environment variables, such as database credentials, application port, and JWT settings.

### Installation and Running the Server
1. Install Packages
Install the necessary packages using npm:
    ```bash
    npm install
    ```

2. Running the Server in Development Mode
Start the NestJS application in development mode:
    ```bash
    npm run start:dev
    ```
    This will start the server on the port specified in your .env file (default is 3000).

### Docker Setup
To run the application with Docker, including a PostgreSQL database:

1. Build and Start Docker Containers
Use Docker Compose to start both the NestJS application and PostgreSQL database:
    ```bash
    docker-compose up --build
    ```
    This command will:

      - Build and start a PostgreSQL container using the specified credentials.
      - Build and start the NestJS container, connecting it to the database.
      - The application will be accessible at http://localhost:3000 (or the port specified in .env).

2. Stopping Containers
To stop the running Docker containers:
    ```bash
    docker-compose down
    ```

3. Resetting the Database Volume
If you need to reset the PostgreSQL database by removing the Docker volume, use:
    ```bash
    docker-compose down -v
    ```

### Database Migrations
This project uses TypeORM for database migrations.
1. Generate a New Migration
To generate a new migration based on changes in your entities:
    ```bash
    npm run migration:generate --name=<migration-name>
    ```
    Replace `<migration-name>` with a descriptive name for the migration.
2. Run Migrations
To apply all pending migrations to the database:
    ```bash
    npm run migration:run
    ```
3. Revert a Migration
To revert the last applied migration:
    ```bash
    npm run migration:revert
    ```

### Testing

This project includes both unit tests and end-to-end (e2e) tests. Follow the instructions below to run each type of test. To run unit tests:

```
npm run test:e2e
```

This command runs all unit tests using Jest. Unit tests are located in the src directory and are typically named *.spec.ts.

To run e2e tests:

```
npm run test:e2e
```

Important: Before running e2e tests, ensure that `.env.test` file exists in the root directory. This file should contain environment variables specific to the test environment, such as database credentials and JWT secrets.