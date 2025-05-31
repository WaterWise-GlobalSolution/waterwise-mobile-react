# WaterWise - Aplicativo Mobile

**WaterWise** é um aplicativo React Native desenvolvido para a Global Solution 2025 da FIAP, focado na gestão inteligente de recursos hídricos em propriedades rurais.

## 📱 Sobre o Projeto

O WaterWise é uma solução tecnológica para enfrentar eventos extremos relacionados à água, oferecendo monitoramento inteligente, alertas em tempo real e otimização do uso de recursos hídricos em propriedades rurais.

## ✨ Funcionalidades

### 🎯 Principais Features
- **Onboarding Intuitivo**: 3 telas de boas-vindas apresentando o app
- **Autenticação Completa**: Login e cadastro em duas etapas
- **Dashboard Inteligente**: Visão geral do consumo e eficiência
- **Perfil Personalizável**: Upload de foto e configurações
- **Modo Noturno**: Design elegante e confortável para os olhos

### 📊 Funcionalidades do Dashboard
- Monitoramento de uso de água em tempo real
- Alertas de eficiência e economia
- Condições climáticas
- Atividade recente do sistema
- Ações rápidas para gestão

### ⚙️ Configurações
- Edição de perfil com foto
- Configurações de notificações
- Alertas personalizáveis
- Sincronização automática
- Autenticação biométrica

## 🛠️ Tecnologias Utilizadas

- **React Native** com **TypeScript**
- **Expo** para desenvolvimento
- **React Navigation** para navegação
- **Expo Linear Gradient** para gradientes
- **AsyncStorage** para persistência local
- **Expo Image Picker** para upload de fotos
- **Vector Icons** para ícones

## 📋 Estrutura do Projeto

```
src/
├── contexts/
│   └── AuthContext.tsx
├── screens/
│   ├── Welcome/
│   │   └── WelcomeScreen.tsx
│   ├── Auth/
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterUserScreen.tsx
│   │   └── RegisterAddressScreen.tsx
│   ├── Dashboard/
│   │   └── DashboardScreen.tsx
│   └── Settings/
│       └── SettingsScreen.tsx
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 16 ou superior)
- Expo CLI
- Dispositivo móvel com Expo Go ou emulador

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/WaterWise-GlobalSolution/waterwise-mobile-react
   cd WaterWise
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Execute o projeto**
   ```bash
   npm start
   ```

4. **Abra no dispositivo**
   - Escaneie o QR Code com o app Expo Go
   - Ou execute em emulador Android/iOS

## 🎨 Design System

### Cores Principais
- **Background**: `#1A1A1A` (Preto principal)
- **Surface**: `#2D2D2D` (Cinza escuro)
- **Primary**: `#00FFCC` (Olo)
- **Text Primary**: `#FFFFFF` (Branco)
- **Text Secondary**: `#CCCCCC` (Cinza claro)

### Tipografia
- **Fonte**: Poppins (system default)
- **Logo**: "W**A**TERW**I**SE" (A e I destacados em #00FFCC)

## 🔐 Autenticação

O app utiliza Context API para gerenciamento de estado de autenticação:
- Login com email e senha
- Cadastro em duas etapas (usuário + propriedade)
- Persistência com AsyncStorage
- Logout com confirmação

## 📝 Fluxo de Navegação

1. **First Launch**: Welcome (3 páginas) → Login
2. **Login**: Login → Dashboard
3. **Cadastro**: RegisterUser → RegisterAddress → Dashboard
4. **Authenticated**: Dashboard ⟷ Settings

## 🔄 Estado da Aplicação

### AuthContext
- `user`: Dados do usuário logado
- `property`: Dados da propriedade
- `isAuthenticated`: Status de autenticação
- `login()`: Função de login
- `register()`: Função de cadastro
- `logout()`: Função de logout

## 📱 Telas Implementadas

### 1. WelcomeScreen
- 3 páginas com PagerView
- Apresentação das funcionalidades
- Navegação por indicadores
- Botão "Pular" e "Próximo/Começar"

### 2. LoginScreen
- Formulário com validação
- Toggle para mostrar/ocultar senha
- Link para cadastro
- Loading state

### 3. RegisterUserScreen
- Cadastro de dados pessoais
- Validação de email e senha
- Barra de progresso (Passo 1/2)
- Requisitos de senha visíveis

### 4. RegisterAddressScreen
- Cadastro da propriedade
- Formatação automática de CEP
- Validação de campos obrigatórios
- Barra de progresso (Passo 2/2)

### 5. DashboardScreen
- Cards de estatísticas
- Ações rápidas
- Atividade recente
- Informações climáticas
- Pull-to-refresh

### 6. SettingsScreen
- Perfil com foto editável
- Configurações do app
- Switches para preferências
- Logout com confirmação


## 👥 Equipe

- **Nome do Grupo**: WaterWise

- **Integrantes**: <br> 
Felipe Amador - RM 553528 <br>
Leonardo de Oliveira - RM554024 <br>
Sara Gabrielle Sousa - RM552656 <br>

- **Turma**: 2TDSPS - Agosto 2025


## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos como parte da Global Solution 2025 da FIAP.

---

**WaterWise** - Gestão Inteligente de Água 💧
