import ForgotPasswordForm from "../components/ForgotPasswordForm.jsx";

export default function ForgotPassword() {
  return (
    <div className="mx-auto max-w-sm px-6 py-24">
      <h1 className="font-display text-3xl text-ivory">Reset your password</h1>
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}