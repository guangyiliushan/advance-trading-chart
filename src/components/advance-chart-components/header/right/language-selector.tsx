import { useEffect, useState } from "react";
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type languageOption = { language: string; code: string };

const languageOptions: languageOption[] = [
  { language: "English", code: "en" },
  { language: "简体中文", code: "zh_CN" },
];

const LanguageSelector = () => {
  // Set the initial language from i18next's detected or default language
  const [language, setLanguage] = useState(i18next.language);

  const { i18n } = useTranslation();

  const handleLanguageChange = (selectedLanguage: string) => {
    setLanguage(selectedLanguage);
    i18next.changeLanguage(selectedLanguage); // Update language in i18next
  };

  useEffect(() => {
    document.body.dir = i18n.dir(); //sets the body to ltr or rtl
  }, [i18n, i18n.language]);

  return (
    <Select value={language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="选择语言" />
      </SelectTrigger>
      <SelectContent>
        {languageOptions.map(({ language, code }) => (
          <SelectItem value={code} key={code}>
            {language}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;