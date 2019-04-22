const get_ping = (req, res) => {
  res.status(200).json({
    success: true,
    text: "The server is Up and Running..."
  });
};

const get_landing = (req, res) => {
  res.status(200).json({
    text: "This is the landing page. Not authentication required",
    success: true
  });
};

module.exports = app => {
  app.get("/api/ping", get_ping);
  app.get("/api/home", get_landing);
};
