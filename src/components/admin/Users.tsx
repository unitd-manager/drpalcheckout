// Users.tsx
import api from "@/constants/api";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  zoho_contact_id: string;
};

type Subscription = {
  invoice_id: string;
  item_name: string;
  enrolled_on_date: string;
};

export default function Users() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(false);

  /* modal + subscription state */
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [subs, setSubs] = useState<Subscription[] | null>(null);
  const [subsLoading, setSubsLoading] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  /* fetch users on mount */
  useEffect(() => {
    setLoading(true);
    api
      .get("/admin.php?action=list_users")
      .then((r) => r.data)
      .then((d) => setUsers(d.status ? d.data : []))
      .finally(() => setLoading(false));
  }, []);

  /** open modal & fetch subs for a given user */
  const viewSubs = (user: User) => {
    setModalTitle(`${user.first_name} ${user.last_name} - Subscriptions`);
    setSubs(null);
    setSubsLoading(true);
    onOpen();

    api
      .get(
        `/get-subscription.php?customer_id=${user.zoho_contact_id}&action=all`
      )
      .then((r) => r.data)
      .then((d) => {
        setSubs(d.status ? d.invoices : []);
      })
      .finally(() => setSubsLoading(false));
  };

  return (
    <>
      <Box overflowX="auto">
        {loading && <Spinner />}
        <Table variant="simple" size="md" bg="white" rounded="md" shadow="md">
          <Thead bg="gray.100">
            <Tr>
              <Th>First Name</Th>
              <Th>Last Name</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Zoho Contact Id</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users?.map((u) => (
              <Tr key={u.id}>
                <Td>{u.first_name}</Td>
                <Td>{u.last_name}</Td>
                <Td>{u.email}</Td>
                <Td>{u.phone}</Td>
                <Td>{u.zoho_contact_id}</Td>
                <Td>
                  {/* remove button left for future */}
                  <Button
                    ml={5}
                    size="sm"
                    colorScheme="green"
                    onClick={() => viewSubs(u)}
                  >
                    View Subscription
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* subscription modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{modalTitle}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {subsLoading && <Spinner />}
            {!subsLoading && subs?.length === 0 && (
              <Text>No subscriptions found.</Text>
            )}
            {subs?.map((s: any) => (
              <Box
                key={s.invoice_id}
                p={3}
                mb={3}
                borderWidth="1px"
                rounded="md"
              >
                <Text fontWeight="bold">{s.item_name}</Text>
                <Text fontSize="sm">Invoice: {s.invoice_id}</Text>
                <Text fontSize="sm">Enrolled On: {s.date}</Text>
                <Text fontSize="sm">Plan: {s.line_items[0].item_name}</Text>
                <Text fontSize="sm">Total: {s.line_items[0].item_total}</Text>
                <Text fontSize="sm">
                  Validity : {s.line_items[0].validity_days} days
                </Text>
              </Box>
            ))}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
