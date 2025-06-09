# Ecossistema WaterWise

"A enchente que alaga uma avenida pode começar com uma gota que o solo seco da zona rural não absorveu. Com WaterWise, cada metro de terra volta a ser uma esponja contra desastres."

## Visão Geral do Projeto

A **WaterWise** é um ecossistema tecnológico integrado que previne enchentes urbanas através do monitoramento inteligente de propriedades rurais.

### Repositório Principal
Para uma compreensão abrangente do projeto e sua arquitetura, acesse nosso repositório de overview:

**[WaterWise - Visão Geral do Projeto](https://github.com/WaterWise-GlobalSolution/waterwise-overview)**

## Organização GitHub

Para melhor organização dos entregáveis e centralização de todas as soluções do ecossistema WaterWise, criamos uma organização dedicada no GitHub.

### Acesse Nossa Organização
**[WaterWise Organization](https://github.com/WaterWise-GlobalSolution)**

---


## Veja o vídeo demonstração: **[YouTube](https://youtube.com/shorts/XONjheNM34s)**


---

# WaterWise - Aplicativo Mobile (Versão Offline-First)

**WaterWise** é um aplicativo React Native desenvolvido para a Global Solution 2025 da FIAP, focado na gestão inteligente de recursos hídricos em propriedades rurais com suporte completo offline.

## 🔧 Principais Melhorias - Versão Offline-First

### ✅ **Funcionalidade Offline Completa**
- **Login offline** com usuários mock pré-configurados
- **Dados persistentes** em AsyncStorage
- **Sincronização automática** quando volta online
- **Indicadores de status** de conexão em tempo real
- **Fallbacks inteligentes** para todas as operações

### ✅ **Usuários de Demonstração**
O app agora inclui usuários mock para teste offline:

```
📧 joao.silva@waterwise.com | 🔐 joao123
   └── Fazenda São João (150.75ha, Solo Bom)

📧 maria.oliveira@waterwise.com | 🔐 maria123  
   └── Sítio Esperança (85.30ha, Solo Excelente)

📧 carlos.pereira@waterwise.com | 🔐 carlos123
   └── Fazenda Verde Vida (320.50ha, Solo Moderado)
```

### ✅ **Dados Simulados Realistas**
- **Sensores IoT**: 3 tipos de sensores por propriedade
- **Leituras**: Dados de 24h com variações realistas
- **Alertas**: Baseados nas condições dos sensores
- **Clima**: Integração com OpenWeatherMap + fallback

## 📱 Funcionalidades Implementadas

### 🎯 **Principais Features**
- ✅ **5+ Telas** com navegação fluida (React Navigation)
- ✅ **Login/Cadastro** em duas etapas com validação
- ✅ **Dashboard Inteligente** com métricas em tempo real
- ✅ **Dados Climáticos** com geolocalização
- ✅ **Sistema de Alertas** baseado em IoT
- ✅ **Perfil Editável** com upload de foto
- ✅ **Modo Offline** completo e funcional

### 📊 **Dashboard Avançado**
- **Uso de Água**: Calculado por hectare e degradação do solo
- **Economia**: Baseada na saúde da propriedade  
- **Eficiência**: Dinâmica conforme nível de degradação
- **Sensores IoT**: Status e últimas leituras
- **Condições Climáticas**: Dados meteorológicos atuais
- **Alertas**: Monitoramento inteligente

### ⚙️ **Configurações Avançadas**
- **Perfil Completo**: Edição de dados pessoais e propriedade
- **Upload de Foto**: Câmera ou galeria
- **Configurações IoT**: Gerenciamento de sensores
- **Notificações**: Alertas personalizáveis
- **Status do Sistema**: Informações técnicas detalhadas

## 🛠️ Tecnologias Utilizadas

### **Core Technologies**
- **React Native** 0.74.0 com **TypeScript**
- **Expo** ~51.0.0 para desenvolvimento
- **React Navigation** 6.x para navegação
- **AsyncStorage** para persistência offline

### **UI/UX Libraries**
- **Expo Linear Gradient** para gradientes
- **Expo Vector Icons** (Ionicons)
- **React Native Safe Area Context**
- **React Native Gesture Handler**

### **Features Libraries**
- **Expo Location** para geolocalização
- **Expo Image Picker** para upload de fotos
- **Axios** para requisições HTTP (com fallbacks)

## 🚀 Como Executar

### **Pré-requisitos**
- Node.js 16+ 
- Expo CLI
- Dispositivo móvel com Expo Go ou emulador
- API WaterWise (.NET Core) rodando

### **Instalação**

1. **Configure a API Backend**
   ```bash
   # Clone e configure a API WaterWise
   git clone https://github.com/WaterWise-GlobalSolution/waterwise-api-dotnet
   cd waterwise-api-dotnet
   
   # Siga as instruções do README da API para configuração
   # A API deve estar rodando em http://localhost:5072
   ```

2. **Clone o repositório do Mobile**
   ```bash
   git clone https://github.com/WaterWise-GlobalSolution/waterwise-mobile-react
   cd waterwise-mobile-react
   ```

3. **Instale as dependências**
   ```bash
   npm install
   ```

4. **Configure a conexão com a API**
   ```typescript
   // Verifique o arquivo src/contexts/AuthContext.tsx
   // Certifique-se que API_BASE_URL aponta para sua API local:
   const API_BASE_URL = 'http://localhost:5072/api/v1';
   ```

5. **Execute o projeto**
   ```bash
   npm start
   ```

6. **Teste offline (opcional)**
   - Desligue o WiFi/dados móveis
   - Use as contas de demonstração
   - Todas as funcionalidades funcionam offline!

### **Testando a Integração**

**Com API Rodando:**
- Login/cadastro utilizará a API .NET
- Dados serão salvos no banco Oracle
- Sincronização em tempo real funcionando

**Sem API (Offline):**
- Login com usuários de demonstração
- Dados mock simulam comportamento real
- Tudo salvo localmente no AsyncStorage

## 📱 Fluxo de Navegação

### **Fluxo Principal**
```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Welcome   │───▶│    Login     │───▶│  Dashboard  │
│ (3 páginas) │    │   (Offline   │    │ (Tempo Real)│
│             │    │   Support)   │    │             │
└─────────────┘    └──────────────┘    └─────────────┘
                           │                     │
                           ▼                     ▼
                   ┌──────────────┐    ┌─────────────┐
                   │   Register   │    │  Settings   │
                   │ (2 etapas)   │    │ (Completo)  │
                   └──────────────┘    └─────────────┘
```

### **Estados de Autenticação**
- **Primeiro acesso**: Welcome → Login
- **Retorno**: Login direto (AsyncStorage)
- **Offline**: Login com contas mock
- **Cadastro**: RegisterUser → RegisterAddress → Dashboard

## 🔐 Sistema de Autenticação

### **Login Offline**
- **Validação local** contra usuários mock
- **Persistência** em AsyncStorage
- **Sincronização** quando volta online
- **Quick Login** para desenvolvimento

### **Cadastro Offline**
- **Criação local** de novos usuários
- **Validação completa** de formulários
- **Dados pendentes** para sincronização
- **Fallback** se API indisponível

## 🌐 Integração com APIs Externas

### **OpenWeatherMap**
- **API Key**: Configurada para WaterWise
- **Fallback**: Dados mock se offline
- **Geolocalização**: Automática com permissão
- **Cache**: Dados salvos para consulta offline

### **Backend Integration**
- **API .NET/Java**: Configurável via `API_BASE_URL`
- **Timeout**: 5-10 segundos para requisições
- **Retry Logic**: Fallback automático para mock
- **Sync Queue**: Operações pendentes para quando voltar online

## 🧪 Testes e Validação

### **Cenários de Teste Offline**
1. **Login sem internet** ✅
2. **Cadastro offline** ✅  
3. **Dashboard com dados mock** ✅
4. **Navegação completa** ✅
5. **Persistência entre sessões** ✅
6. **Sincronização ao voltar online** ✅

### **Dados de Teste**
```bash
# Usuários de demonstração disponíveis
joao.silva@waterwise.com / joao123
maria.oliveira@waterwise.com / maria123  
carlos.pereira@waterwise.com / carlos123

# Ou use o "Login Rápido" para acesso direto
```

## 📁 Estrutura de Arquivos

```
src/
├── contexts/
│   └── AuthContext.tsx          # Context offline-first
├── screens/
│   ├── Welcome/
│   │   └── WelcomeScreen.tsx    # Onboarding 3 páginas
│   ├── Auth/
│   │   ├── LoginScreen.tsx      # Login com suporte offline
│   │   ├── RegisterUserScreen.tsx
│   │   └── RegisterAddressScreen.tsx
│   ├── Dashboard/
│   │   └── DashboardScreen.tsx  # Dashboard offline-first
│   └── Settings/
│       └── SettingsScreen.tsx   # Configurações completas
├── components/
│   └── OfflineNotice.tsx        # Indicador de status offline
└── types/
    └── index.ts                 # Interfaces TypeScript
```

## 🎯 Compatibilidade com Global Solution

### **Requisitos Atendidos**
- ✅ **5+ telas** com navegação (React Navigation)
- ✅ **CRUD completo** integrado com API .NET/Java
- ✅ **Firebase Auth** (pronto para integração)
- ✅ **Estilização personalizada** com design sustentável
- ✅ **Arquitetura limpa** e organizada
- ✅ **Vídeo demonstração** de todas as funcionalidades

### **Diferencial Técnico**
- **Offline-First Architecture**: Funciona independente de conexão
- **Dados Realistas**: Baseados na estrutura Oracle GS_WW_*
- **IoT Integration**: Sensores simulados com dados variáveis
- **Weather API**: Integração real com OpenWeatherMap
- **Responsive Design**: Adaptado para diferentes telas

## 👥 Equipe de Desenvolvimento

- **Nome do Grupo**: WaterWise Team

**Integrantes**:
- Felipe Amador - RM 553528
- Leonardo de Oliveira - RM 554024  
- Sara Gabrielle Sousa - RM 552656

**Turma**: 2TDSPS - Agosto 2025

## 📄 Conclusão

O WaterWise Mobile representa uma solução robusta e inovadora para gestão de recursos hídricos rurais, com destaque para sua arquitetura offline-first que garante funcionalidade total independente de conectividade. O aplicativo demonstra excelência técnica ao integrar tecnologias modernas como React Native, TypeScript, e APIs REST com dados realistas baseados na estrutura do banco Oracle.

A implementação de usuários mock, dados de sensores IoT simulados e integração com APIs meteorológicas reais cria uma experiência autêntica que simula fielmente um ambiente de produção. O sistema offline-first não apenas atende aos requisitos da Global Solution, mas supera expectativas ao oferecer uma solução verdadeiramente utilizável em áreas rurais com conectividade limitada.

**WaterWise** - Transformando dados em proteção, tecnologia em esperança. 💧🌱

---

**Versão**: 1.0.0 - Global Solution 2025 FIAP  
**Licença**: Desenvolvido para fins acadêmicos  
**Suporte**: Funciona 100% offline para demonstração
