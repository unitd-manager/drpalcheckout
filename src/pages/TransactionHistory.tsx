import {
  Box,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spacer,
  Button,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/constants/useAuthStore";
import api from "@/constants/api";
import moment from "moment";
import pdfMake from "pdfmake/build/pdfmake";
// @ts-ignore
import pdfFonts from "./vfs_fonts";
pdfMake.vfs = pdfFonts;

const TransactionHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // const handleDownloadInvoice = (invoiceUrl: string) => {
  //   // Open invoice PDF in new tab (or download with custom logic)
  //   window.open(invoiceUrl, "_blank");
  // };

  useEffect(() => {
    if (!user?.zoho_contact_id) return;

    api
      .get(
        `/get-subscription.php?customer_id=${user.zoho_contact_id}&action=all`
      )
      .then((res) => {
        if (res.data.status) {
          const transformed = res.data.invoices.map((inv: any) => ({
            id: inv.invoice_number,
            date: inv.date,
            plan: inv.line_items[0]?.name || "N/A",
            amount: `$${inv.total}`,
            status: inv.status,
            invoiceUrl: inv.invoice_url,
          }));
          setTransactions(transformed);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch invoices:", err);
      })
      .finally(() => setLoading(false));
  }, [user]);
  const generatePdf = (txn: any) => {
    var dd = {
      pageSize: "A4",
      pageMargins: [40, 60, 40, 60],
      content: [
        {
          columns: [
            {
              image:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAChCAMAAABK+nL1AAAACXBIWXMAAA7EAAAOxAGVKw4bAAADAFBMVEVHcEz/t3v/t3v/t3v/t3v/t3v/t3v/t3v/t3v/t3v/t3ujromjron/t3ujron/t3v/t3ujron/t3v/t3v/t3ujron/t3ujromjromjron/t3ujromjromjron/t3v/t3ujromjromjron/t3v/t3v/t3ujromjromjromjromjron/t3v/t3v/t3v/t3v/t3v/t3v/t3ujromjron/t3ujromjromjron/t3v/t3v/t3ujromjromjromjromjromjron/t3v/t3v/t3v/t3v/t3v/t3v/t3v/t3v/t3v/t3ujromjromjromjromjromjromjromjromjromjromjromjromjron/t3v/t3v/t3v/t3v/t3v/t3v/t3v/t3v/t3v/t3v/t3ujromjromjromjromjromjromjromjromjromjromjron/t3v/t3v/t3v/t3v/t3v/t3v/t3v/t3v/t3v/t3ujromjromjromjromjron/t3v/t3v/t3v/t3v/t3v/t3v/t3v/t3v/t3v/t3v/t3v/t3v/t3ujromjromjromjromjron///+jromjromjromjromjromjron/t3v/t3v/t3v/t3v/t3v/t3v/t3v/t3ujromjron///+jromjromjron/t3v/t3v/t3v/t3v/t3ujromjromjron///+jron///////+jron/////t3v/t3v/t3v/t3v/t3v/t3v/t3ujron/t3v///////////////////////////+jron/////t3v/t3v///////////////////////////////////////+jron/////////t3v/t3v/////////////////////////////////////////////////////////////////////////////t3ujron/////xpb/7+L/+vb/7N3/1LH//Pv/48v/6df/3sL/5tH/4Mf/zqT/0Kr/vIX/8Ob/+PL/uX//u4L/1rX/wI3/yJvLcdl5AAAA6HRSTlMA9QIKgyRGDGaZ/Qb66wm5NhxMXloCIOnu/RKf1eDRGt0E99mXYRjBW5jalQTjLvtDvj/0+S2oy22M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", // Keep your base64 logo here
              width: 200,
              margin: [0, 0, 0, 20],
            },
            {
              stack: [
                {
                  text: "INVOICE",
                  fontSize: 20,
                  bold: true,
                  alignment: "right",
                  margin: [0, 0, 0, 4],
                },
                {
                  text: "# " + txn.id,
                  fontSize: 12,
                  alignment: "right",
                  color: "#555",
                },
              ],
              width: "*",
            },
          ],
        },
        {
          columns: [
            {
              stack: [
                { text: "NEWME.FIT, LLC", bold: true },
                {
                  text: "3225 MCLEOD DR\nSuite #100\nLas Vegas Nevada 89121\nU.S.A",
                  margin: [0, 2],
                },
                { text: "info@drpalsnewme.com" },
              ],
              margin: [0, 0, 0, 30],
            },
            {
              stack: [
                {
                  text: "Balance Due",
                  alignment: "right",
                  margin: [0, 5, 0, 0],
                },
                { text: "$0.00", bold: true, fontSize: 14, alignment: "right" },
              ],
              margin: [0, 0, 0, 30],
            },
          ],
        },
        {
          columns: [
            {
              text: [{ text: "Bill To:\n", bold: true }, user?.name || "N/A"],
              margin: [0, 0, 0, 20],
            },
            {
              text: [
                { text: "Invoice Date: ", bold: true },
                `${moment().format("MMMM Do YYYY")}\n\n`,
                { text: "Terms: ", bold: true },
                "Due On Receipt\n\n",
                { text: "Due Date: ", bold: true },
                `${moment().format("MMMM Do YYYY")}`,
              ],
              alignment: "right",
              margin: [0, 0, 0, 20],
            },
          ],
        },
        {
          table: {
            widths: ["auto", "*", "auto", "auto", "auto"],
            body: [
              [
                {
                  text: "#",
                  bold: true,
                  fillColor: "#333",
                  color: "white",
                  margin: [5, 5, 5, 5],
                },
                {
                  text: "Item & Description",
                  bold: true,
                  fillColor: "#333",
                  color: "white",
                  margin: [5, 5, 5, 5],
                },
                {
                  text: "Qty",
                  bold: true,
                  fillColor: "#333",
                  color: "white",
                  margin: [5, 5, 5, 5],
                },
                {
                  text: "Rate",
                  bold: true,
                  fillColor: "#333",
                  color: "white",
                  margin: [5, 5, 5, 5],
                },
                {
                  text: "Amount",
                  bold: true,
                  fillColor: "#333",
                  color: "white",
                  margin: [5, 5, 5, 5],
                },
              ],
              [
                { text: "1", margin: [5, 5, 5, 5] },
                { text: txn.plan, margin: [5, 5, 5, 5] },
                { text: "1.00", margin: [5, 5, 5, 5] },
                { text: txn.amount.replace("$", ""), margin: [5, 5, 5, 5] },
                { text: txn.amount.replace("$", ""), margin: [5, 5, 5, 5] },
              ],
            ],
          },
          layout: "lightHorizontalLines",
          margin: [0, 0, 0, 20],
        },
        {
          columns: [
            { text: "" },
            {
              table: {
                widths: ["*", "auto"],
                body: [
                  ["Sub Total", txn.amount.replace("$", "")],
                  ["Total", { text: txn.amount, bold: true }],
                  [
                    "Payment Made",
                    {
                      text: `(-) ${txn.amount.replace("$", "")}`,
                      color: "red",
                    },
                  ],
                  [
                    { text: "Balance Due", bold: true },
                    { text: "$0.00", bold: true },
                  ],
                ],
              },
              layout: "noBorders",
              margin: [0, 0, 0, 30],
            },
          ],
        },
        { text: "Notes", bold: true, margin: [0, 0, 0, 5] },
        { text: "Thank you for the payment. You just made our day." },
      ],
    };
    // @ts-ignore
    pdfMake.createPdf(dd).open(); // or .download('invoice.pdf')
  };

  return (
    <Flex direction="column" minH="100vh" bg="gray.50">
      <Box
        as="header"
        bg="white"
        px={8}
        py={4}
        boxShadow="sm"
        borderBottom="1px solid"
        borderColor="gray.200"
      >
        <Flex align="center">
          <Heading size="md" color="brand.primary">
            Transaction History
          </Heading>
          <Spacer />
          <Button
            colorScheme="red"
            variant="outline"
            size="sm"
            onClick={() => navigate("/subscription")}
          >
            Back to Dashboard
          </Button>
        </Flex>
      </Box>

      <Box flex="1" px={8} py={10}>
        <Heading fontSize="2xl" mb={6} color="gray.800">
          💳 Your Transactions
        </Heading>

        {loading ? (
          <Spinner size="lg" />
        ) : transactions.length === 0 ? (
          <Text color="gray.500">No transactions found.</Text>
        ) : (
          <Box overflowX="auto">
            <Table
              variant="simple"
              size="md"
              bg="white"
              rounded="md"
              shadow="md"
            >
              <Thead bg="gray.100">
                <Tr>
                  <Th>Transaction ID</Th>
                  <Th>Date</Th>
                  <Th>Plan</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th>Invoice</Th>
                </Tr>
              </Thead>
              <Tbody>
                {transactions.map((txn: any, index) => (
                  <Tr key={index}>
                    <Td>{txn.id}</Td>
                    <Td>{txn.date}</Td>
                    <Td>{txn.plan}</Td>
                    <Td>{txn.amount}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          txn.status.toLowerCase() === "paid"
                            ? "green"
                            : txn.status.toLowerCase() === "pending"
                            ? "yellow"
                            : "red"
                        }
                      >
                        {txn.status}
                      </Badge>
                    </Td>
                    <Td>
                      <Button
                        size="xs"
                        colorScheme="blue"
                        variant="outline"
                        onClick={() => generatePdf(txn)}
                      >
                        View Invoice
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>

      <Box
        as="footer"
        textAlign="center"
        p={4}
        bg="gray.100"
        fontSize="sm"
        color="gray.600"
      >
        © {new Date().getFullYear()} Drpalsnewme. All rights reserved.
      </Box>
    </Flex>
  );
};

export default TransactionHistory;
