import { useState } from "react"
import type { Assistance } from "../../../types/assistance"
import { validateAssistance } from "../utils/validate";
import { useToastStore } from "../../../store/toastStore";
import type { ToastMessage } from "../../../types/toastMessage";
import { useAssistanceStore } from "../store/assistanceStore";
import { useAuthStore } from "../../auth/store/authStore";

export const useAssis = () => {

    const {createData, fetchData, fetchOneData, updateData, deleteData} = useAssistanceStore();
    const showToast = useToastStore((state) => state.showToast);
    const {membership} = useAuthStore();

    const [form, setForm] = useState<Assistance>({
        name: "",
        assistance_id: 0,
        description: "",
        created_by: membership?.id
    });

    const [errors, setErrors] = useState({
        name: false,
        assistance_id: false,
    });

const handleClearForm = () => {
    setForm({
        name: "",
        assistance_id: 0,
        description: "",
        created_by: membership?.id
    })
}

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {name, value} = e.target;
    setForm((prev) => ({
        ...prev,
        [name]: value
    }));
}


const handleSubmit = async (id?: number): Promise<boolean> => {
  // 1. Validate
  const { hasErrors, formErrors, data } = validateAssistance(form);
  setErrors(formErrors);

  if (hasErrors) {
    return false;
  }

  try {
    let result: ToastMessage;

    if (id) {
      result = await updateData(id, data);
    } else {
      // Create new
      result = await createData(data);
    }

    // 3. Show toast
    showToast(result);

    // 4. On success: refresh list + reset form
    if (result.type === "success") {
      await fetchData();

      // Reset form (only if create or after successful update)
      setForm({
        name: "",
        description: "",
        assistance_id: 0,
        created_by: membership?.id ?? 0, // keep current user if exists
      });

      return true;
    }

    return false;
  } catch (error) {
    console.error("Submit error:", error);
    return false;
  }
};

const handleView = async (id: number): Promise<any> => {

    const response: Assistance = await fetchOneData(id);

    setForm({
        name: response.name,
        assistance_id: response.assistance_id,
        description: response.description,
        created_by: membership?.id
    })

}


const handleDelete = async (id: number): Promise<boolean> => {

    if (!id || id <= 0) {
        return false;
    }

    const result = await deleteData(id);
    showToast(result);
    await fetchData();
    return result.type === "success";
}


    return{
        form,
        setForm,
        errors,

        handleChange,
        handleSubmit,
        handleView,
        handleClearForm,
        handleDelete
    }

}