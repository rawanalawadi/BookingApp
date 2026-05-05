import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components"
import { Booking } from "@/lib/types"

interface Props {
  booking: Booking
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number)
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`
}

export default function BookingConfirmationEmail({ booking }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Your consultation with {booking.consultantName} is confirmed</Preview>
      <Body style={{ backgroundColor: "#f9fafb", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "12px", overflow: "hidden" }}>

          {/* Header */}
          <Section style={{ backgroundColor: "#0d9488", padding: "32px 40px" }}>
            <Heading style={{ color: "#ffffff", fontSize: "22px", margin: 0 }}>
              Booking Confirmed ✓
            </Heading>
            <Text style={{ color: "#99f6e4", fontSize: "14px", margin: "8px 0 0" }}>
              Your consultation has been successfully scheduled.
            </Text>
          </Section>

          {/* Details */}
          <Section style={{ padding: "32px 40px" }}>
            <Text style={{ fontSize: "16px", fontWeight: "bold", color: "#111827", margin: "0 0 20px" }}>
              Consultation Details
            </Text>

            <Row style={{ marginBottom: "12px" }}>
              <Text style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>Name</Text>
              <Text style={{ fontSize: "15px", fontWeight: "600", color: "#111827", margin: "2px 0 0" }}>
                {booking.customerName}
              </Text>
            </Row>
            <Row style={{ marginBottom: "12px" }}>
              <Text style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>Phone</Text>
              <Text style={{ fontSize: "15px", fontWeight: "600", color: "#111827", margin: "2px 0 0" }}>
                {booking.customerPhone}
              </Text>
            </Row>
            <Row style={{ marginBottom: "12px" }}>
              <Text style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>Consultant</Text>
              <Text style={{ fontSize: "15px", fontWeight: "600", color: "#111827", margin: "2px 0 0" }}>
                {booking.consultantName}
              </Text>
            </Row>
            <Row style={{ marginBottom: "12px" }}>
              <Text style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>Specialty</Text>
              <Text style={{ fontSize: "15px", fontWeight: "600", color: "#111827", margin: "2px 0 0" }}>
                {booking.consultantSpecialty}
              </Text>
            </Row>
            <Row style={{ marginBottom: "12px" }}>
              <Text style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>Date</Text>
              <Text style={{ fontSize: "15px", fontWeight: "600", color: "#111827", margin: "2px 0 0" }}>
                {formatDate(booking.date)}
              </Text>
            </Row>
            <Row style={{ marginBottom: "12px" }}>
              <Text style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>Time</Text>
              <Text style={{ fontSize: "15px", fontWeight: "600", color: "#111827", margin: "2px 0 0" }}>
                {formatTime(booking.timeSlot)}
              </Text>
            </Row>
            <Row style={{ marginBottom: "12px" }}>
              <Text style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>Session Type</Text>
              <Text style={{ fontSize: "15px", fontWeight: "600", color: "#111827", margin: "2px 0 0" }}>
                {booking.sessionType === "online" ? "Online (Video Call)" : "In Person"}
              </Text>
            </Row>

            <Hr style={{ borderColor: "#e5e7eb", margin: "20px 0" }} />

            {booking.notes && (
              <Row>
                <Text style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>Your Notes</Text>
                <Text style={{ fontSize: "14px", color: "#374151", margin: "4px 0 0", lineHeight: "1.6" }}>
                  {booking.notes}
                </Text>
              </Row>
            )}

            <Hr style={{ borderColor: "#e5e7eb", margin: "20px 0" }} />

            <Row>
              <Text style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>Session Rate</Text>
              <Text style={{ fontSize: "16px", fontWeight: "700", color: "#0d9488", margin: "2px 0 0" }}>
                {booking.hourlyRate.toLocaleString("en-KW", { style: "currency", currency: "KWD" })}/hr
              </Text>
            </Row>

            {booking.paymentReference && (
              <Row style={{ marginTop: "12px" }}>
                <Text style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>Payment Reference</Text>
                <Text style={{ fontSize: "14px", color: "#374151", margin: "2px 0 0" }}>
                  {booking.paymentReference}
                </Text>
              </Row>
            )}
          </Section>

          {/* Footer */}
          <Section style={{ backgroundColor: "#f9fafb", padding: "20px 40px", borderTop: "1px solid #e5e7eb" }}>
            <Text style={{ fontSize: "12px", color: "#9ca3af", margin: 0, textAlign: "center" }}>
              If you need to reschedule or cancel, please contact us as soon as possible.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}
