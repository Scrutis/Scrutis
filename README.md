<img align="right" src="https://visitor-badge.laobi.icu/badge?page_id=Scrutis.Scrutis&right_color=%230078ff" />

<h1 align="center">
    <img src="https://readme-typing-svg.herokuapp.com/?font=Righteous&color=EEEEEE&size=35&center=true&vCenter=true&width=700&height=70&duration=4500&lines=🛡️+Scrutis+🛡️;Cloud-Native+Cybersecurity+Platform" />
</h1>

# About Us
Scrutis is an open-source Platform-as-a-Service (PaaS) designed to bring automated malware analysis, real-time log monitoring, and SOC-as-a-Service capabilities to individuals, developers, and small organizations without the cost or complexity of traditional infrastructure.









# shadcn/ui monorepo template

This template is for creating a monorepo with shadcn/ui.

## Usage

```bash
pnpm dlx shadcn@latest init
```

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Tailwind

Your `tailwind.config.ts` and `globals.css` are already set up to use the components from the `ui` package.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@scrutis/ui/components/button"
```
