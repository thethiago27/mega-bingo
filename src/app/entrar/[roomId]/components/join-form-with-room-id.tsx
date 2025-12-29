"use client";

import { useForm, revalidateLogic } from "@tanstack/react-form";
import { InputField } from "@/components/input-field";
import { z } from "zod";
import { ArrowRight, User } from "lucide-react";
import PrimaryButton from "@/components/PrimaryButton";
import { useRouter } from "next/navigation";
import { FieldGroup } from "@/components/ui/field";
import { useEffect, useState } from "react";
import { checkRoomExists } from "@/lib/database";

const formSchema = z.object({
  nome: z.string().min(5, "Nome muito curto").trim(),
});

interface JoinFormWithRoomIdProps {
  roomId: string;
}

export function JoinFormWithRoomId({ roomId }: JoinFormWithRoomIdProps) {
  const router = useRouter();
  const [roomError, setRoomError] = useState<string | null>(null);
  const [checkingRoom, setCheckingRoom] = useState(true);

  useEffect(() => {
    const validateRoom = async () => {
      try {
        const exists = await checkRoomExists(roomId);
        if (!exists) {
          setRoomError("Sala não encontrada!");
        }
      } catch {
        setRoomError("Erro ao verificar sala");
      } finally {
        setCheckingRoom(false);
      }
    };

    validateRoom();
  }, [roomId]);

  const form = useForm({
    defaultValues: {
      nome: "",
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      router.push(`/sala/${roomId}?nome=${encodeURIComponent(value.nome)}`);
    },
  });

  if (checkingRoom) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Verificando sala...</p>
      </div>
    );
  }

  if (roomError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Sala Inválida
        </h3>
        <p className="text-red-700 mb-4">{roomError}</p>
        <button
          onClick={() => router.push("/entrar")}
          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex flex-col gap-5"
    >
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          Entrando na sala:{" "}
          <span className="font-mono font-bold">{roomId}</span>
        </p>
      </div>

      <FieldGroup>
        <form.Field name="nome">
          {(field) => (
            <div className="flex flex-col gap-2">
              <InputField
                id={field.name}
                label="Nome do Jogador"
                placeholder="Digite seu nome ou apelido"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                icon={User}
                required
              />
              {field.state.meta.errors.map((error, i) => (
                <p key={i} className="text-red-500 text-sm">
                  {typeof error === "string" ? error : error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>
      </FieldGroup>

      <form.Subscribe>
        {({ isSubmitting, isFormValid }) => (
          <PrimaryButton
            type="submit"
            icon={ArrowRight}
            disabled={isSubmitting || !isFormValid}
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </PrimaryButton>
        )}
      </form.Subscribe>
    </form>
  );
}
