import { type Config } from "tailwindcss";
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        jost: ['Jost', ...defaultTheme.fontFamily.sans]
      },
      colors: {
        'primary': '#FF7800',
        'secondary' :'#CC4440',
        'dark' : '#24222D',
        'light': '#FAD2AD',
        'light2': '#F7F8F7',
      }
    },
  },
  plugins: [],
} satisfies Config;
