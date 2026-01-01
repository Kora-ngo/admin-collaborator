import { useCallback, useEffect, useState } from "react"
import type { Assistance } from "../../../types/assistance"
import { validateAssistance } from "../utils/validate";
import { useToastStore } from "../../../store/toastStore";
import type { ToastMessage } from "../../../types/toastMessage";
import { useAssistanceStore } from "../store/assistanceStore";
import { useAuthStore } from "../../auth/store/authStore";
import { useAssistanceTypeStore } from "../store/assistanceTypeStore";

export const useAssis = () => {

    const {createData, getData, fetchOneData, filterData, updateData, toggleData} = useAssistanceStore();
    const showToast = useToastStore((state) => state.showToast);
    const typeData = useAssistanceTypeStore((state) => state.data);


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

    // Search state
      const [searchTerm, setSearchTerm] = useState("");

      // Debounced search → triggers store fetch
      useEffect(() => {
          const timer = setTimeout(() => {
            getData(1, searchTerm);
            // setFilterMode(false);
          }, 500);

          return () => clearTimeout(timer);
        }, [getData]);

      // Initial load (no search)
      // useEffect(() => {
      //   getData(1, "");
      // }, [getData]);

      const handleSearch = (value: string) => {
        setSearchTerm(value);
      };

      const clearSearch = () => {
        setSearchTerm("");
      };


        // Add filter state
        const [filterMode, setFilterMode] = useState(false);
        const [filters, setFilters] = useState({
          status: "",
          typeId: 0,
          datePreset: "all"
        });

        // Toggle filter on/off
        const toggleFilter = () => {
          setFilterMode(prev => !prev);
          if (!filterMode) {
            setSearchTerm("");
          }
        };

        // Apply filters
        const applyFilters = useCallback(() => {
          if (!filterMode) {
            getData(1, searchTerm); // normal list or search
            return;
          }

        const activeFilters: any = {};
        if (filters.status) activeFilters.status = filters.status;
        if (filters.typeId > 0) activeFilters.typeId = filters.typeId;
        if (filters.datePreset !== "all") activeFilters.datePreset = filters.datePreset;

        filterData(1, activeFilters);
      }, [filterMode, filters, searchTerm, getData, filterData]);

      // Trigger fetch when filter/search changes
      useEffect(() => {
      applyFilters();
      }, [applyFilters]);

      const handleStatusChange = (value: string) => setFilters(prev => ({ ...prev, status: value }));
      const handleTypeChange = (value: number) => setFilters(prev => ({...prev, typeId: value}));
      const handleDatePresetChange = (value: string) => {
          setFilters(prev => ({ ...prev, datePreset: value }));
      };



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
  

    const refreshCurrentPage = (page: number) => {
      filterMode ? filterData(page, filters) : getData(page, searchTerm)
    };


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
          await getData();
          handleClearForm();

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

    const handleToggle = async (id: number, status: string): Promise<boolean> => {

        if (!id || id <= 0) {
            return false;
        }

        const result = await toggleData(id, status);
        showToast(result);
        await getData();
        return result.type === "success";
    }
  



    return{
      form,
      setForm,
      errors,
      searchTerm,

      handleChange,
      handleSubmit,
      handleView,
      handleToggle,
      handleClearForm,
      handleTypeChange,

      handleSearch,
      clearSearch,
      refreshCurrentPage,

      typeData,
      filterMode,
      toggleFilter,
      filters,
      handleStatusChange,
      handleDatePresetChange
    };

}