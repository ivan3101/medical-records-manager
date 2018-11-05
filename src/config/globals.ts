import { config } from "dotenv";
config();

export const variables = {
  db_host: process.env.DB_HOST,
  db_name: process.env.DB_NAME,
  db_password: process.env.DB_PASSWORD,
  db_port: process.env.DB_PORT,
  db_username: process.env.DB_USERNAME,
  env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10) || 3000,
  secret: process.env.SECRET
};
