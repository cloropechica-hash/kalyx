tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-primary-container": "var(--on-primary-container)", "on-surface": "var(--on-surface)",
        "outline": "var(--outline)", "on-background": "var(--on-background)",
        "on-secondary-fixed": "var(--on-secondary-fixed)", "surface-container-highest": "var(--surface-container-highest)",
        "inverse-surface": "var(--inverse-surface)", "tertiary-fixed-dim": "var(--tertiary-fixed-dim)",
        "surface": "var(--surface)", "secondary": "var(--secondary)", "on-secondary": "var(--on-secondary)",
        "on-primary-fixed-variant": "var(--on-primary-fixed-variant)", "secondary-container": "var(--secondary-container)",
        "on-error": "var(--on-error)", "on-primary": "var(--on-primary)",
        "on-error-container": "var(--on-error-container)", "on-tertiary": "var(--on-tertiary)",
        "surface-container-high": "var(--surface-container-high)", "inverse-on-surface": "var(--inverse-on-surface)",
        "on-secondary-container": "var(--on-secondary-container)", "surface-variant": "var(--surface-variant)",
        "primary-container": "var(--primary-container)", "error-container": "var(--error-container)",
        "tertiary": "var(--tertiary)", "inverse-primary": "var(--inverse-primary)",
        "secondary-fixed-dim": "var(--secondary-fixed-dim)", "tertiary-container": "var(--tertiary-container)",
        "surface-container-low": "var(--surface-container-low)", "surface-container-lowest": "var(--surface-container-lowest)",
        "on-tertiary-container": "var(--on-tertiary-container)", "on-secondary-fixed-variant": "var(--on-secondary-fixed-variant)",
        "surface-container": "var(--surface-container)", "on-primary-fixed": "var(--on-primary-fixed)",
        "error": "var(--error)", "background": "var(--background)", "primary-fixed": "var(--primary-fixed)",
        "surface-tint": "var(--surface-tint)", "outline-variant": "var(--outline-variant)",
        "primary-fixed-dim": "var(--primary-fixed-dim)", "on-tertiary-fixed": "var(--on-tertiary-fixed)",
        "on-tertiary-fixed-variant": "var(--on-tertiary-fixed-variant)", "on-surface-variant": "var(--on-surface-variant)",
        "tertiary-fixed": "var(--tertiary-fixed)", "primary": "var(--primary)", "surface-dim": "var(--surface-dim)",
        "surface-bright": "var(--surface-bright)", "secondary-fixed": "var(--secondary-fixed)"
      },
      borderRadius: { DEFAULT: "0.5rem", lg: "0.75rem", xl: "1rem", full: "9999px" },
      fontFamily: {
        "headline-md": ["-apple-system", "Inter", "system-ui", "sans-serif"],
        "body-lg": ["-apple-system", "Inter", "system-ui", "sans-serif"],
        "label-md": ["-apple-system", "Inter", "system-ui", "sans-serif"],
        "title-lg": ["-apple-system", "Inter", "system-ui", "sans-serif"],
        "code-sm": ["-apple-system", "Inter", "system-ui", "sans-serif"],
        "display-lg": ["-apple-system", "Inter", "system-ui", "sans-serif"],
        "body-md": ["-apple-system", "Inter", "system-ui", "sans-serif"],
        "headline-lg-mobile": ["-apple-system", "Inter", "system-ui", "sans-serif"],
        "headline-lg": ["-apple-system", "Inter", "system-ui", "sans-serif"]
      },
      fontSize: {
        "headline-md": ["24px", {lineHeight: "32px", fontWeight: "600"}],
        "body-lg": ["16px", {lineHeight: "24px", fontWeight: "400"}],
        "label-md": ["12px", {lineHeight: "16px", fontWeight: "500"}],
        "title-lg": ["20px", {lineHeight: "28px", fontWeight: "600"}],
        "code-sm": ["12px", {lineHeight: "16px", fontWeight: "400"}],
        "display-lg": ["48px", {lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700"}],
        "body-md": ["14px", {lineHeight: "20px", fontWeight: "400"}],
        "headline-lg-mobile": ["24px", {lineHeight: "32px", fontWeight: "600"}],
        "headline-lg": ["32px", {lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "600"}]
      }
    }
  }
}
