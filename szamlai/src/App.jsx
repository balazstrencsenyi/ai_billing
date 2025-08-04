import { useState } from "react";
import "./App.css";
import { Link } from "react-router-dom";



// MUI Components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

function App() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setEmail("");
  };

  return (
    <>
      {/* HEADER */}
      <AppBar position="fixed" color="default" elevation={1}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box className="szamlai-logo">
            Száml<span className="ai">AI</span>
          </Box>

          <IconButton edge="end" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* MAIN CONTENT */}
      <div className="container">
        <h1>SzámlAI</h1>
        <p className="tagline">
          NAV-kompatibilis számlakészítő mesterséges intelligenciával, magyar
          vállalkozóknak.
        </p>

        {submitted ? (
          <p className="success">
            Köszönjük! Hamarosan jelentkezünk e-mailben.
          </p>
        ) : (
          <form className="form" onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              placeholder="Add meg az e-mail címed"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Csatlakozom a bétához</button>
          </form>
        )}

        <footer className="footer">
          &copy; {new Date().getFullYear()} SzámlAI — Made in Hungary 🇭🇺
        </footer>
        <Link
          to="/invoice"
          style={{
            marginTop: "2rem",
            display: "inline-block",
            color: "#0070f2",
          }}
        >
          ➕ Ugrás a számlázó oldalra
        </Link>
      </div>
    </>
  );
}

export default App;