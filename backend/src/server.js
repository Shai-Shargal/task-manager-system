/**
 * HTTP server entry point — starts the Express application.
 */

const app = require('./app');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Employee Task Manager API listening on port ${PORT}`);
});
