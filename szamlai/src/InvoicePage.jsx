import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts?.pdfMake?.vfs || pdfFonts.vfs;

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
                (row.quantity * row.price * (1 + row.vat / 100)).toLocaleString("hu-HU") + " Ft",
              ]),
            ],
          },
        },
        "\n",
        { text: `Végösszeg: ${total.toLocaleString("hu-HU")} Ft`, bold: true },
      ],
      styles: {
        header: {
          fontSize: 20,
          bold: true,
          marginBottom: 10,
        },
      },
    };

    pdfMake.createPdf(docDefinition).download("szamla.pdf");
  };

  return (
    <Box sx={{ p: 4, maxWidth: "960px", mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Számla létrehozása
      </Typography>

      {/* Számla adatok */}
      <Typography variant="h6" sx={{ mt: 3 }}>
        Számla adatok
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <TextField
            label="Számlaszám"
            fullWidth
            onChange={(e) =>
              setInvoiceData({ ...invoiceData, number: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Teljesítés dátuma"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            onChange={(e) =>
              setInvoiceData({ ...invoiceData, date: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Fizetési határidő"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            onChange={(e) =>
              setInvoiceData({ ...invoiceData, dueDate: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Fizetési mód"
            fullWidth
            onChange={(e) =>
              setInvoiceData({ ...invoiceData, paymentMethod: e.target.value })
            }
          />
        </Grid>
      </Grid>

      {/* Eladó */}
      <Typography variant="h6">Eladó</Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Cégnév"
            fullWidth
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
            onChange={(e) =>
              setInvoiceData({
                ...invoiceData,
                seller: { ...invoiceData.seller, taxNumber: e.target.value },
              })
            }
          />
        </Grid>
      </Grid>

      {/* Vevő */}
      <Typography variant="h6">Vevő</Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Cégnév"
            fullWidth
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
            onChange={(e) =>
              setInvoiceData({
                ...invoiceData,
                buyer: { ...invoiceData.buyer, taxNumber: e.target.value },
              })
            }
          />
        </Grid>
      </Grid>

      {/* Tételek */}
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
          <Grid item xs={3} md={2}>
            <TextField
              label="Mennyiség"
              type="number"
              fullWidth
              value={row.quantity}
              onChange={(e) => handleRowChange(index, "quantity", e.target.value)}
            />
          </Grid>
          <Grid item xs={3} md={2}>
            <TextField
              label="Nettó ár"
              type="number"
              fullWidth
              value={row.price}
              onChange={(e) => handleRowChange(index, "price", e.target.value)}
            />
          </Grid>
          <Grid item xs={3} md={2}>
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

      <Button
        variant="contained"
        startIcon={<PictureAsPdfIcon />}
        sx={{ mt: 2 }}
        onClick={exportPDF}
      >
        PDF exportálás
      </Button>
    </Box>
  );
}

export default InvoicePage;
