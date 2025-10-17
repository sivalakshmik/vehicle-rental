import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Just show success message — backend webhook already created booking
    Swal.fire({
      icon: "success",
      title: "Payment Successful!",
      text: "Your booking has been confirmed and added to your dashboard.",
      timer: 2500,
      showConfirmButton: false,
    });

    // ✅ Redirect to dashboard after short delay
    const timer = setTimeout(() => {
      navigate("/dashboard");
      window.location.reload(); // ensures new booking appears
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col justify-center items-center h-screen text-center">
      <h2 className="text-2xl font-bold text-green-600 mb-2">
        Payment Successful!
      </h2>
      <p className="text-gray-700">Redirecting to your dashboard...</p>
    </div>
  );
}
