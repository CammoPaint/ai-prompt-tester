# AI Prompt Testing Platform

A powerful, modern web application for testing and comparing AI prompts across multiple providers. Built with React, TypeScript, and Tailwind CSS, this platform allows developers and AI enthusiasts to experiment with different language models, save prompts, and analyze responses.

## ✨ Features

### 🤖 Multi-Provider Support
- **OpenAI**: GPT-4, GPT-3.5 Turbo, and other OpenAI models
- **OpenRouter**: Access to various models through OpenRouter's API
- **Perplexity**: Sonar models and research-focused AI
- **DeepSeek**: Advanced reasoning and coding models
- **Grok**: X.AI's conversational AI models
- **Qwen**: Alibaba's multilingual language models
- **Local LLM (Ollama)**: Run models locally without API keys

### 🎯 Core Functionality
- **Interactive Playground**: Test prompts with real-time responses
- **System & User Prompts**: Separate fields for system instructions and user queries
- **Response Formats**: Choose between Markdown and JSON output
- **Token Usage Tracking**: Monitor input, output, and total token consumption
- **Response Time Metrics**: Track API response performance

### 💾 Data Management
- **Save Prompts**: Store your best prompts with titles and metadata
- **Firebase Integration**: Secure cloud storage for prompts and settings
- **User Authentication**: Email/password authentication with Firebase Auth
- **API Key Management**: Securely store API keys in your browser

### 🔍 Advanced Features
- **Model Comparison**: Side-by-side comparison of responses from different models
- **Dark/Light Theme**: Beautiful UI that adapts to your preference
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Syntax Highlighting**: Code blocks with proper syntax highlighting
- **Markdown Rendering**: Rich text rendering for formatted responses

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase project (for authentication and data storage)
- API keys for the providers you want to use
- Ollama installed locally (optional, for local LLM support)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-prompt-testing-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Email/Password
3. Create a Firestore database
4. Copy your Firebase config to the `.env` file
5. Deploy the Firestore security rules from `firestore.rules`

## 🔧 Configuration

### API Keys
After signing up and logging in:
1. Go to Settings (API Keys)
2. Add your API keys for the providers you want to use:
   - **OpenAI**: Get from [OpenAI API Keys](https://platform.openai.com/api-keys)
   - **OpenRouter**: Get from [OpenRouter Dashboard](https://openrouter.ai/keys)
   - **Perplexity**: Get from [Perplexity API](https://docs.perplexity.ai/)
   - **DeepSeek**: Get from [DeepSeek Platform](https://platform.deepseek.com/)
   - **Grok**: Get from [X.AI Console](https://console.x.ai/)
   - **Qwen**: Get from [Alibaba Cloud](https://dashscope.console.aliyun.com/)

### Local LLM (Ollama)
To use local models with Ollama:

1. **Install Ollama**
   ```bash
   # macOS
   brew install ollama
   
   # Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   ```

2. **Start Ollama service**
   ```bash
   ollama serve
   ```

3. **Pull models**
   ```bash
   ollama pull llama2
   ollama pull mistral
   ollama pull codellama
   ```

4. **Select "Local LLM (Ollama)" in the app**
   The app will automatically detect available models.

## 🎨 Usage

### Basic Prompt Testing
1. Select your preferred AI provider and model
2. Enter a system prompt (optional) to set the AI's behavior
3. Write your user prompt in the main text area
4. Choose response format (Markdown or JSON)
5. Click Submit to get the AI response

### Saving Prompts
1. After testing a prompt, click "Save Prompt"
2. Enter a descriptive title
3. Your prompt and response will be saved to your account

### Comparing Models
1. Go to "Saved Prompts"
2. Click "Compare" on any saved prompt
3. Add multiple columns with different providers/models
4. Run comparison to see side-by-side responses

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand with persistence
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Build Tool**: Vite
- **Icons**: Lucide React

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components
│   ├── playground/     # Prompt testing components
│   ├── saved/          # Saved prompts components
│   └── settings/       # Settings components
├── pages/              # Page components
├── services/           # API and Firebase services
├── store/              # Zustand state stores
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🔒 Security

- **API Keys**: Stored locally in browser, never sent to our servers
- **Authentication**: Secure Firebase Auth with email/password
- **Data Privacy**: Your prompts are stored in your own Firebase project
- **Firestore Rules**: Strict security rules ensure users can only access their own data

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Deploy to Vercel
1. Connect your repository to Vercel
2. Environment variables will be automatically detected
3. Deploy with zero configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include browser console errors and steps to reproduce

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons provided by [Lucide React](https://lucide.dev/)
- Backend services by [Firebase](https://firebase.google.com/)
- Local LLM support via [Ollama](https://ollama.ai/)