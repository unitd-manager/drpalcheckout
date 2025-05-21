import api from "@/constants/api";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Box,
  Spinner,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";

type Subscription = {
  id: number;
  invoice_id: string;
  item_name: string;
  enrolled_on_date: string;
  enrolled_on_time: string;
  payment_id: string | null;
  payment_gateway: string | null;
  is_synced: 0 | 1;
  first_name?: string; // optional if JOINed
  last_name?: string;
  customer_name?: string;
};

export default function Subscription() {
  const [subs, setSubs] = useState<Subscription[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get("/admin.php?action=list_subscriptions")
      .then((r) => r.data)
      .then((d) => setSubs(d.status ? d.data : []))
      .finally(() => setLoading(false));
  }, []);
  return (
    <Box>
      {loading && <Spinner></Spinner>}
      <Table variant="striped" colorScheme="gray">
        <Thead>
          <Tr>
            <Th>S.No</Th>
            <Th>Invoice ID</Th>
            <Th>Plan</Th>
            <Th>Payment ID</Th>
            <Th>Customer Name</Th>

            <Th>Enroll Date</Th>
            <Th>Gateway</Th>
            <Th>Synced</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {subs?.map((s, i) => (
            <Tr>
              <Td>{i + 1}</Td>
              <Td>{s.invoice_id}</Td>
              <Td>{s.item_name}</Td>
              <Td>{s.payment_id}</Td>
              <Td>{s.customer_name}</Td>
              <Td>
                {s.enrolled_on_date} {s.enrolled_on_time}
              </Td>
              <Td>{s.payment_gateway}</Td>
              <Td>{s.is_synced}</Td>
              <Td>
                <Button size="sm">View</Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
