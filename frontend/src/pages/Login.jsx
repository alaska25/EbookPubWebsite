import LoginForm from "../components/LoginForm.jsx";

// Kept as a real route for direct links and for ProtectedRoute's
// `navigate("/login", { state: { from } })` redirect. The Navbar's "Sign in"
// button opens AuthModal instead of visiting this page.
export default function Login() {
  return (
    <div className="mx-auto max-w-sm px-6 py-24">
      <h1 className="font-display text-3xl text-ivory">Sign in</h1>
      <div className="mt-8">
        <LoginForm />
      </div>
    </div>
  );
}