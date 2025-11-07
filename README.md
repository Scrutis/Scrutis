<img align="right" src="https://visitor-badge.laobi.icu/badge?page_id=Scrutis.Scrutis&right_color=%230078ff" />

<h1 align="center">
    <img src="https://readme-typing-svg.herokuapp.com/?font=Righteous&color=EEEEEE&size=35&center=true&vCenter=true&width=700&height=70&duration=4500&lines=🛡️+Scrutis+🛡️;Cloud-Native+Cybersecurity+Platform" />
</h1>

![](https://github.com/Scrutis/Scrutis/blob/main/our_team.png)

# About Us
Scrutis is an open-source Platform-as-a-Service (PaaS) designed to bring automated malware analysis, real-time log monitoring, and SOC-as-a-Service capabilities to individuals, developers, and small organizations without the cost or complexity of traditional infrastructure.

# Overview
Scrutis combines **cybersecurity**, **cloud computing**, and **DevOps automation** into a unified platform.  
Users can:

- 🧩 **Submit files or URLs** for malware detection through static and dynamic analysis (sandboxing).  
- 📡 **Stream system logs in real-time** via WebSockets for continuous threat detection.  
- 📊 **View interactive dashboards** that visualize risk scores, alerts, and historical security data.  
- 🧠 **Receive automated reports** with recommendations and alerts for critical incidents.

# Core Features
**`More details will be added to this section`**
## 🔍 1. Malware Analysis
## 📡 2. Real-Time Log Monitoring
## 📊 3. Dashboard & Reporting
## 🔄 4. DevOps Integration
## 🔐 5. Security & Sandbox Isolation

# System Architecture
**`More details will be added to this section`**

# Technologies Used
**`More details will be added to this section`**
## Frontend
[![Frontend](https://skillicons.dev/icons?i=js,ts&perline=6)](https://skillicons.dev)
## Backend
## Malware Analysis
## Logs & SIEM
## DevOps
## Cloud Infra
## Security
## Automation

# Repository Structure
**`More details will be added to this section`**


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
