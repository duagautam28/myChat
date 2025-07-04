import {create} from 'zustand'

export const useThemeStore = create((set) => ({
    theme: localStorage.getItem("mytheme") ||"night",
    setTheme: (theme) =>{
        localStorage.setItem("mytheme",theme)
         set({ theme });
    }
}));