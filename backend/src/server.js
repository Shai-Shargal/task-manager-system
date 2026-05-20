/**
 * HTTP server entry point — starts the Express application.
 */

const app = require('./app');
/* Default 5001: macOS AirPlay Receiver often binds port 5000 */
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Employee Task Manager API listening on port ${PORT}`);
});
