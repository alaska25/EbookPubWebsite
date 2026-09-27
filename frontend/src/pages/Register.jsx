import RegisterForm from "../components/RegisterForm.jsx";

// Kept as a real route for direct links. The Navbar's "Sign in" button opens
// AuthModal (in "register" mode via the modal's own switch link) instead.
export default function Register() {
  return (
    <div className="mx-auto max-w-sm px-6 py-24">
      <h1 className="font-display text-3xl text-ivory">Create an account</h1>
      <div className="mt-8">
        <RegisterForm />
      </div>
    </div>
  );
}