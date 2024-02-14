'use client'

import * as Form from '@radix-ui/react-form'
import {
  Card,
  Container,
  Flex,
  Heading,
  Text,
  TextField,
} from '@radix-ui/themes'
import { registerUser } from '@/app/actions'

export default function Home() {
  function handleSubmit(formData: FormData) {
    registerUser(formData)
  }

  return (
    <Container
      style={{
        height: '100vh',
        backgroundSize: 'cover',
        backgroundImage:
          'url(https://media.istockphoto.com/id/1456192902/pl/zdj%C4%99cie/zbli%C5%BCenie-zdj%C4%99cia-kobiety-pisz%C4%85cej-raport-biznesowy-na-klawiaturze-laptopa-w-kawiarni.jpg?s=1024x1024&w=is&k=20&c=6JxNOGRc0sxzab1uE2w0jlaBeHdQYfQ9ne9WQ3TRspI=)',
      }}
    >
      <Flex direction="column" align="center" gap="2">
        <Heading size="4">Welcome to MoneyTrack</Heading>
        <Card>
          <Flex direction="column" align="center" gap="2">
            <Text>Track your spendings for multiple accounts</Text>
            <Text>See your balance</Text>
            <Text>Plan your budget</Text>
          </Flex>
          <Form.Root action={handleSubmit}>
            <Form.Field name="email">
              <Form.Label htmlFor="email">Email:</Form.Label>
              <Form.Control id="email" type="email" required asChild>
                <TextField.Input />
              </Form.Control>
            </Form.Field>

            <Form.Field name="password">
              <Form.Label htmlFor="password">Password:</Form.Label>
              <Form.Control id="password" type="password" required asChild>
                <TextField.Input />
              </Form.Control>
            </Form.Field>

            <Form.Field name="firstName">
              <Form.Label htmlFor="firstName">First Name:</Form.Label>
              <Form.Control id="firstName" type="text" required asChild>
                <TextField.Input />
              </Form.Control>
            </Form.Field>

            <Form.Field name="lastName">
              <Form.Label htmlFor="lastName">Last Name:</Form.Label>
              <Form.Control id="lastName" type="text" required asChild>
                <TextField.Input />
              </Form.Control>
            </Form.Field>

            <Form.Submit>Register</Form.Submit>
          </Form.Root>
        </Card>
      </Flex>
    </Container>
  )
}
