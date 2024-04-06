export default () => ({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_NAME: process.env.DATABASE_NAME,
  DATABASE_USER: process.env.DATABASE_USER,
  DATABASE_PASS: process.env.DATABASE_PASS,
  DATABASE_CLUSTER: process.env.DATABASE_CLUSTER,
  DATABASE_URI: `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASS}@${process.env.DATABASE_CLUSTER}/${process.env.DATABASE_NAME}`,
});
