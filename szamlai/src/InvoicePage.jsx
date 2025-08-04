// InvoicePage.jsx - Final Combined Version

import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Button,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import LogoutIcon from "@mui/icons-material/Logout";
import EmailIcon from "@mui/icons-material/Email";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts?.pdfMake?.vfs || pdfFonts.vfs;

import { auth, db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import emailjs from "@emailjs/browser";

function InvoicePage() {
  const [invoiceData, setInvoiceData] = useState({
    number: "",
    date: "",
    dueDate: "",
    paymentMethod: "",
    seller: { name: "", taxNumber: "" },
    buyer: { name: "", taxNumber: "" },
    rows: [{ description: "", quantity: 1, price: 0, vat: 27 }],
  });

  const [invoiceList, setInvoiceList] = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");

  const handleRowChange = (index, field, value) => {
    const newRows = [...invoiceData.rows];
    newRows[index][field] = field === "description" ? value : parseFloat(value);
    setInvoiceData((prev) => ({ ...prev, rows: newRows }));
  };

  const addRow = () => {
    setInvoiceData((prev) => ({
      ...prev,
      rows: [...prev.rows, { description: "", quantity: 1, price: 0, vat: 27 }],
    }));
  };

  const total = invoiceData.rows.reduce((sum, row) => {
    return sum + row.quantity * row.price * (1 + row.vat / 100);
  }, 0);

  const exportPDF = () => {
    const docDefinition = {
      content: [
        { text: "Számla", style: "header" },
        { text: `Számlaszám: ${invoiceData.number}` },
        { text: `Teljesítés: ${invoiceData.date}` },
        { text: `Fizetési határidő: ${invoiceData.dueDate}` },
        { text: `Fizetési mód: ${invoiceData.paymentMethod}` },
        "\n",
        { text: `Eladó: ${invoiceData.seller.name} (${invoiceData.seller.taxNumber})` },
        { text: `Vevő: ${invoiceData.buyer.name} (${invoiceData.buyer.taxNumber})` },
        "\n",
        {
          table: {
            headerRows: 1,
            widths: ["*", "auto", "auto", "auto", "auto"],
            body: [
              ["Leírás", "Mennyiség", "Nettó ár", "ÁFA %", "Bruttó"],
              ...invoiceData.rows.map((row) => [
                row.description,
                row.quantity,
                row.price.toLocaleString("hu-HU"),
                row.vat + "%",
                (
                  row.quantity *
                  row.price *
                  (1 + row.vat / 100)
                ).toLocaleString("hu-HU") + " Ft",
              ]),
            ],
          },
        },
        "\n",
        { text: `Végösszeg: ${total.toLocaleString("hu-HU")} Ft`, bold: true },
      ],
      styles: { header: { fontSize: 20, bold: true, marginBottom: 10 } },
    };

    pdfMake.createPdf(docDefinition).download("szamla.pdf");
  };

  const saveToCloud = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Nincs bejelentkezve!");

    const invoiceRef = collection(db, "users", user.uid, "invoices");
    await addDoc(invoiceRef, invoiceData);
    alert("Sikeres mentés a felhőbe.");
    fetchInvoices();
  };

  const fetchInvoices = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const snapshot = await getDocs(collection(db, "users", user.uid, "invoices"));
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setInvoiceList(list);
  };

  const loadSelectedInvoice = async () => {
    const user = auth.currentUser;
    if (!user || !selectedInvoiceId) return;
    const ref = doc(db, "users", user.uid, "invoices", selectedInvoiceId);
    const snapshot = await getDoc(ref);
    if (snapshot.exists()) setInvoiceData(snapshot.data());
  };

  const sendEmail = () => {
    emailjs.send(
      "service_d31hzrb", // replace with your actual service ID
      "template_lzqkx1g", // replace with your template ID
      {
        name: invoiceData.buyer.name,
        email: "b.trencsenyi@gmail.com", // Replace with dynamic recipient if needed
        message: `Számlaszám: ${invoiceData.number}, Összeg: ${total.toLocaleString("hu-HU")} Ft`,
      },
      "LyXfjNVPOUd8z2tsS" // replace with your actual public key
    );
    alert("E-mail elküldve!");
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <Box sx={{ p: 4, maxWidth: "960px", mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h4">Számla létrehozása</Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={() => signOut(auth)}
        >
          Kijelentkezés
        </Button>
      </Box>

      <TextField
        select
        fullWidth
        label="Korábbi számlák"
        value={selectedInvoiceId}
        onChange={(e) => {
          setSelectedInvoiceId(e.target.value);
          loadSelectedInvoice();
        }}
        sx={{ mt: 3, mb: 3 }}
      >
        <MenuItem value="">Korábbi számla kiválasztása</MenuItem>
        {invoiceList.map((inv) => (
          <MenuItem key={inv.id} value={inv.id}>
            {inv.number || inv.id}
          </MenuItem>
        ))}
      </TextField>

      {/* FORM FIELDS */}
      <Typography variant="h6" sx={{ mt: 3 }}>
        Számla adatok
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <TextField
            label="Számlaszám"
            fullWidth
            value={invoiceData.number}
            onChange={(e) => setInvoiceData({ ...invoiceData, number: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Teljesítés dátuma"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={invoiceData.date}
            onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Fizetési határidő"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={invoiceData.dueDate}
            onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Fizetési mód"
            fullWidth
            value={invoiceData.paymentMethod}
            onChange={(e) => setInvoiceData({ ...invoiceData, paymentMethod: e.target.value })}
          />
        </Grid>
      </Grid>

      <Typography variant="h6">Eladó</Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Cégnév"
            fullWidth
            value={invoiceData.seller.name}
            onChange={(e) =>
              setInvoiceData({
                ...invoiceData,
                seller: { ...invoiceData.seller, name: e.target.value },
              })
            }
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Adószám"
            fullWidth
            value={invoiceData.seller.taxNumber}
            onChange={(e) =>
              setInvoiceData({
                ...invoiceData,
                seller: { ...invoiceData.seller, taxNumber: e.target.value },
              })
            }
          />
        </Grid>
      </Grid>

      <Typography variant="h6">Vevő</Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Cégnév"
            fullWidth
            value={invoiceData.buyer.name}
            onChange={(e) =>
              setInvoiceData({
                ...invoiceData,
                buyer: { ...invoiceData.buyer, name: e.target.value },
              })
            }
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Adószám"
            fullWidth
            value={invoiceData.buyer.taxNumber}
            onChange={(e) =>
              setInvoiceData({
                ...invoiceData,
                buyer: { ...invoiceData.buyer, taxNumber: e.target.value },
              })
            }
          />
        </Grid>
      </Grid>

      <Typography variant="h6">Tételek</Typography>
      {invoiceData.rows.map((row, index) => (
        <Grid
          container
          spacing={2}
          key={index}
          sx={{ mb: 1, alignItems: "center" }}
        >
          <Grid item xs={12} md={4}>
            <TextField
              label="Leírás"
              fullWidth
              value={row.description}
              onChange={(e) => handleRowChange(index, "description", e.target.value)}
            />
          </Grid>
          <Grid item xs={4} md={2}>
            <TextField
              label="Mennyiség"
              type="number"
              fullWidth
              value={row.quantity}
              onChange={(e) => handleRowChange(index, "quantity", e.target.value)}
            />
          </Grid>
          <Grid item xs={4} md={2}>
            <TextField
              label="Nettó ár"
              type="number"
              fullWidth
              value={row.price}
              onChange={(e) => handleRowChange(index, "price", e.target.value)}
            />
          </Grid>
          <Grid item xs={4} md={2}>
            <TextField
              label="ÁFA %"
              type="number"
              fullWidth
              value={row.vat}
              onChange={(e) => handleRowChange(index, "vat", e.target.value)}
            />
          </Grid>
        </Grid>
      ))}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addRow}
        sx={{ mt: 1, mb: 2 }}
      >
        Új tétel
      </Button>

      <Typography variant="h6" sx={{ mt: 3 }}>
        Összesen (bruttó): {total.toLocaleString("hu-HU")} Ft
      </Typography>

      <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={exportPDF}>
          PDF EXPORTÁLÁS
        </Button>
        <Button variant="outlined" onClick={saveToCloud}>
          MENTÉS FELHŐBE
        </Button>
        <Button variant="outlined" startIcon={<EmailIcon />} onClick={sendEmail}>
          E-MAIL KÜLDÉS
        </Button>
      </Box>
    </Box>
  );
}

export default InvoicePage;
