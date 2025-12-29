import AppHeader from "@/components/AppHeader";
import HeroSection from "@/components/bingo/hero-section";
import { JoinForm } from "./components/join-form";

export default function EntrarPage() {
  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-gray-50 font-sans antialiased overflow-x-hidden selection:bg-primary selection:text-white">
      <AppHeader title="Bingo Mobile" />

      <main className="flex-1 flex flex-col items-center w-full max-w-md mx-auto px-4 pb-6 pt-2">
        <HeroSection
          title="Bem-vindo!"
          description="Para começar a diversão, digite o código da sala e seu nome."
          imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuCcFOuBXItqCmL5_qyenUHeOMtg4sATgTb69KCGuIxuPLxBCgQd59eauRlqGeO2dj211HSEeXiGiMQfM_fr8XNKFMjwCDFgnpVYK0f0yrF_Oi3mfCMgTgLsEAXXKPe_sS0plR0WrbFMkBkoiejDmTENtHJQxttYKxoIeF5I2Wxs2qxGsE_TzbnHErwf3RnX_i4Jic71MOYxwfY8x_qr1pxloHW6HJFih-WqQCqzxImpa6E9djXwRMuoQ_3kYRx7GJf_73_OFYvaEA"
        />

        <div className="w-full mt-4">
          <JoinForm />
        </div>

        <div className="flex-1 min-h-[40px]"></div>
      </main>
    </div>
  );
}
