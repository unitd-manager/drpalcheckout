import api from "@/constants/api";
import {
  Box,
  //   Button,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────
   API shape returned by getParticipants
   ───────────────────────────────────────────── */
type Participant = {
  id: number;
  name: string;
  email: string;
  phone: string;
  date_time: string; // "18-05-2025 22:04" (varchar in DB)
  payment_id: string;
};

export default function ParticipantsTable() {
  const [rows, setRows] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    api
      .get("/transform-health-api.php?action=getParticipants")
      .then((r) => r.data)
      .then((d) => setRows(d.status ? d.data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box overflowX="auto">
      {loading && <Spinner size="lg" />}
      {!loading && (
        <Table variant="striped" colorScheme="gray" size="sm">
          <Thead>
            <Tr>
              <Th>S.No</Th>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Date &amp; Time</Th>
              <Th>Payment ID</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((p, idx) => (
              <Tr key={p.id}>
                <Td>{idx + 1}</Td>
                <Td>{p.name}</Td>
                <Td>{p.email}</Td>
                <Td>{p.phone}</Td>
                <Td>{p.date_time}</Td>
                <Td>{p.payment_id}</Td>
                <Td>
                  {/* <Button size="xs" colorScheme="teal">
                    View
                  </Button> */}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
}
