import { render, screen } from "@testing-library/react"
import App from "./App"

test("renders the local sign-in screen", () => {
  localStorage.clear()
  render(<App />)
  expect(screen.getByText("Welcome Back")).toBeInTheDocument()
})
