//@ts-nocheck
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Edit2, Save, Lock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Helpers from "@/config/helpers"
import apiKeyService from "@/services/apiKey.service"

const ApiSettings = () => {
  // OpenAI States
  const [isEditingOpenAI, setIsEditingOpenAI] = useState(false)
  const [openAIKey, setOpenAIKey] = useState("********************************")
  const [actualOpenAIKey, setActualOpenAIKey] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [actualSystemPrompt, setActualSystemPrompt] = useState("")
  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState("")

  // Fal AI States
  const [isEditingFalAI, setIsEditingFalAI] = useState(false)
  const [falAIKey, setFalAIKey] = useState("********************************")
  const [actualFalAIKey, setActualFalAIKey] = useState("")

  // Replicate States
  const [isEditingReplicate, setIsEditingReplicate] = useState(false)
  const [replicateKey, setReplicateKey] = useState("********************************")
  const [actualReplicateKey, setActualReplicateKey] = useState("")

  // Anthropic States
  const [isEditingAnthropic, setIsEditingAnthropic] = useState(false)
  const [anthropicKey, setAnthropicKey] = useState("********************************")
  const [actualAnthropicKey, setActualAnthropicKey] = useState("")
  const [anthropicModels, setAnthropicModels] = useState([])
  const [selectedAnthropicModel, setSelectedAnthropicModel] = useState("")

  // Gemini States
  const [isEditingGemini, setIsEditingGemini] = useState(false)
  const [geminiKey, setGeminiKey] = useState("********************************")
  const [actualGeminiKey, setActualGeminiKey] = useState("")

  // Stripe States
  const [isEditingStripe, setIsEditingStripe] = useState(false)
  const [stripeKey, setStripeKey] = useState("********************************")
  const [actualStripeKey, setActualStripeKey] = useState("")
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState("********************************")
  const [actualStripeWebhookSecret, setActualStripeWebhookSecret] = useState("")

  // Handle OpenAI Edit
  const handleOpenAIEdit = async () => {
    setIsEditingOpenAI(true)
    try {
      const apiSetting = await apiKeyService.getOpenAISettings()
      setActualOpenAIKey(apiSetting.apiKey || "")
      setActualSystemPrompt(apiSetting.systemPrompt || "")
      setSelectedModel(apiSetting.selectedModel || "")
      if (apiSetting.models?.data) {
        setModels(apiSetting.models.data)
      }
    } catch (error) {
      Helpers.showToast("Failed to fetch OpenAI settings", "error")
    }
  }

  // Handle Fal AI Edit
  const handleFalAIEdit = async () => {
    setIsEditingFalAI(true)
    try {
      const apiSetting = await apiKeyService.getFalAISettings()
      setActualFalAIKey(apiSetting.apiKey || "")
    } catch (error) {
      Helpers.showToast("Failed to fetch Fal AI settings", "error")
    }
  }

  // Handle OpenAI Update
  const handleOpenAIUpdate = async () => {
    try {
      await apiKeyService.updateOpenAISettings({
        apiKey: actualOpenAIKey,
        systemPrompt: actualSystemPrompt,
        model: selectedModel,
      })
      setIsEditingOpenAI(false)
      setOpenAIKey("********************************")
      setSystemPrompt(actualSystemPrompt)
      Helpers.showToast("OpenAI settings updated successfully!", "success")
    } catch (error) {
      Helpers.showToast("Failed to update OpenAI settings", "error")
    }
  }

  // Handle Fal AI Update
  const handleFalAIUpdate = async () => {
    try {
      await apiKeyService.updateFalAISettings({ apiKey: actualFalAIKey })
      setIsEditingFalAI(false)
      setFalAIKey("********************************")
      Helpers.showToast("Fal AI settings updated successfully!", "success")
    } catch (error) {
      Helpers.showToast("Failed to update Fal AI settings", "error")
    }
  }

  // Handle Replicate Edit
  const handleReplicateEdit = async () => {
    setIsEditingReplicate(true)
    try {
      const apiSetting = await apiKeyService.getReplicateSettings()
      setActualReplicateKey(apiSetting.apiKey || "")
    } catch (error) {
      Helpers.showToast("Failed to fetch Replicate settings", "error")
    }
  }

  // Handle Replicate Update
  const handleReplicateUpdate = async () => {
    try {
      await apiKeyService.updateReplicateSettings({ apiKey: actualReplicateKey })
      setIsEditingReplicate(false)
      setReplicateKey("********************************")
      Helpers.showToast("Replicate settings updated successfully!", "success")
    } catch (error) {
      Helpers.showToast("Failed to update Replicate settings", "error")
    }
  }

  // Handle Anthropic Edit
  const handleAnthropicEdit = async () => {
    setIsEditingAnthropic(true)
    try {
      const apiSetting = await apiKeyService.getAnthropicSettings()
      setActualAnthropicKey(apiSetting.apiKey || "")
      setSelectedAnthropicModel(apiSetting.selectedModel || "")
      if (apiSetting.models) {
        setAnthropicModels(apiSetting.models)
      }
    } catch (error) {
      Helpers.showToast("Failed to fetch Anthropic settings", "error")
    }
  }

  // Handle Anthropic Update
  const handleAnthropicUpdate = async () => {
    try {
      await apiKeyService.updateAnthropicSettings({
        apiKey: actualAnthropicKey,
        model: selectedAnthropicModel,
      })
      setIsEditingAnthropic(false)
      setAnthropicKey("********************************")
      Helpers.showToast("Anthropic settings updated successfully!", "success")
    } catch (error) {
      Helpers.showToast("Failed to update Anthropic settings", "error")
    }
  }

  // Handle Gemini Edit
  const handleGeminiEdit = async () => {
    setIsEditingGemini(true)
    try {
      const apiSetting = await apiKeyService.getGeminiSettings()
      setActualGeminiKey(apiSetting.apiKey || "")
    } catch (error) {
      Helpers.showToast("Failed to fetch Gemini settings", "error")
    }
  }

  // Handle Gemini Update
  const handleGeminiUpdate = async () => {
    try {
      await apiKeyService.updateGeminiSettings({ apiKey: actualGeminiKey })
      setIsEditingGemini(false)
      setGeminiKey("********************************")
      Helpers.showToast("Gemini settings updated successfully!", "success")
    } catch (error) {
      Helpers.showToast("Failed to update Gemini settings", "error")
    }
  }

  // Handle Stripe Edit
  const handleStripeEdit = async () => {
    setIsEditingStripe(true)
    try {
      const apiSetting = await apiKeyService.getStripeSettings()
      setActualStripeKey(apiSetting.apiKey || "")
      setActualStripeWebhookSecret(apiSetting.webhookSecret || "")
    } catch (error) {
      Helpers.showToast("Failed to fetch Stripe settings", "error")
    }
  }

  // Handle Stripe Update
  const handleStripeUpdate = async () => {
    try {
      await apiKeyService.updateStripeSettings({
        apiKey: actualStripeKey,
        webhookSecret: actualStripeWebhookSecret,
      })
      setIsEditingStripe(false)
      setStripeKey("********************************")
      setStripeWebhookSecret("********************************")
      Helpers.showToast("Stripe settings updated successfully!", "success")
    } catch (error) {
      Helpers.showToast("Failed to update Stripe settings", "error")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            API Settings
          </CardTitle>
          <CardDescription>Manage your AI service API keys and configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="openai" className="w-full">
            <TabsList className="grid grid-cols-6 mb-6">
              <TabsTrigger value="openai">OpenAI</TabsTrigger>
              <TabsTrigger value="falai">Fal AI</TabsTrigger>
              <TabsTrigger value="replicate">Replicate</TabsTrigger>
              <TabsTrigger value="anthropic">Anthropic</TabsTrigger>
              <TabsTrigger value="gemini">Gemini</TabsTrigger>
              <TabsTrigger value="stripe">Stripe</TabsTrigger>
            </TabsList>

            {/* OpenAI Tab Content */}
            <TabsContent value="openai" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">OpenAI Settings</h3>
                  <p className="text-sm text-muted-foreground">Manage OpenAI API key and system prompt</p>
                </div>
                <Button
                  onClick={isEditingOpenAI ? handleOpenAIUpdate : handleOpenAIEdit}
                  className={`
                    transition-all duration-300 
                    ${
                      isEditingOpenAI
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "bg-accent/10 hover:bg-accent/20 text-accent"
                    }
                  `}
                >
                  {isEditingOpenAI ? <Save className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                  {isEditingOpenAI ? "Save Changes" : "Edit Settings"}
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">OpenAI API Key</label>
                <div className="relative">
                  <Input
                    type="text"
                    value={isEditingOpenAI ? actualOpenAIKey : openAIKey}
                    onChange={(e) => setActualOpenAIKey(e.target.value)}
                    disabled={!isEditingOpenAI}
                    className="bg-background/50 border-border/50 focus-visible:ring-primary/30 focus-visible:border-primary pr-10"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Model</label>
                <Select disabled={!isEditingOpenAI} value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="bg-background/50 border-border/50 focus-visible:ring-primary/30 focus-visible:border-primary">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name || model.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Select the OpenAI model to use for chat completions.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">System Prompt</label>
                <Textarea
                  value={isEditingOpenAI ? actualSystemPrompt : systemPrompt}
                  onChange={(e) => setActualSystemPrompt(e.target.value)}
                  disabled={!isEditingOpenAI}
                  placeholder="Enter the default system prompt for the AI (e.g., 'You are a helpful AI assistant...')"
                  className="bg-background/50 border-border/50 focus-visible:ring-primary/30 focus-visible:border-primary min-h-[120px] resize-y"
                />
                <p className="text-xs text-muted-foreground">
                  This prompt sets the default behavior and context for the AI in all conversations.
                </p>
              </div>
            </TabsContent>

            {/* Fal AI Tab Content */}
            <TabsContent value="falai" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Fal AI Settings</h3>
                  <p className="text-sm text-muted-foreground">Manage Fal AI API key</p>
                </div>
                <Button
                  onClick={isEditingFalAI ? handleFalAIUpdate : handleFalAIEdit}
                  className={`
                    transition-all duration-300 
                    ${
                      isEditingFalAI
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "bg-accent/10 hover:bg-accent/20 text-accent"
                    }
                  `}
                >
                  {isEditingFalAI ? <Save className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                  {isEditingFalAI ? "Save Changes" : "Edit Settings"}
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Fal AI API Key</label>
                <div className="relative">
                  <Input
                    type="text"
                    value={isEditingFalAI ? actualFalAIKey : falAIKey}
                    onChange={(e) => setActualFalAIKey(e.target.value)}
                    disabled={!isEditingFalAI}
                    className="bg-background/50 border-border/50 focus-visible:ring-primary/30 focus-visible:border-primary pr-10"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </TabsContent>

            {/* Replicate Tab Content */}
            <TabsContent value="replicate" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Replicate Settings</h3>
                  <p className="text-sm text-muted-foreground">Manage Replicate API key</p>
                </div>
                <Button
                  onClick={isEditingReplicate ? handleReplicateUpdate : handleReplicateEdit}
                  className={`
                    transition-all duration-300 
                    ${
                      isEditingReplicate
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "bg-accent/10 hover:bg-accent/20 text-accent"
                    }
                  `}
                >
                  {isEditingReplicate ? <Save className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                  {isEditingReplicate ? "Save Changes" : "Edit Settings"}
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Replicate API Key</label>
                <div className="relative">
                  <Input
                    type="text"
                    value={isEditingReplicate ? actualReplicateKey : replicateKey}
                    onChange={(e) => setActualReplicateKey(e.target.value)}
                    disabled={!isEditingReplicate}
                    className="bg-background/50 border-border/50 focus-visible:ring-primary/30 focus-visible:border-primary pr-10"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </TabsContent>

            {/* Anthropic Tab Content */}
            <TabsContent value="anthropic" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Anthropic Settings</h3>
                  <p className="text-sm text-muted-foreground">Manage Anthropic API key and model settings</p>
                </div>
                <Button
                  onClick={isEditingAnthropic ? handleAnthropicUpdate : handleAnthropicEdit}
                  className={`
                    transition-all duration-300 
                    ${
                      isEditingAnthropic
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "bg-accent/10 hover:bg-accent/20 text-accent"
                    }
                  `}
                >
                  {isEditingAnthropic ? <Save className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                  {isEditingAnthropic ? "Save Changes" : "Edit Settings"}
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Anthropic API Key</label>
                <div className="relative">
                  <Input
                    type="text"
                    value={isEditingAnthropic ? actualAnthropicKey : anthropicKey}
                    onChange={(e) => setActualAnthropicKey(e.target.value)}
                    disabled={!isEditingAnthropic}
                    className="bg-background/50 border-border/50 focus-visible:ring-primary/30 focus-visible:border-primary pr-10"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Model</label>
                <Select
                  disabled={!isEditingAnthropic}
                  value={selectedAnthropicModel}
                  onValueChange={setSelectedAnthropicModel}
                >
                  <SelectTrigger className="bg-background/50 border-border/50 focus-visible:ring-primary/30 focus-visible:border-primary">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {anthropicModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name || model.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Select the Anthropic model to use for chat completions.</p>
              </div>
            </TabsContent>

            {/* Gemini Tab Content */}
            <TabsContent value="gemini" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Gemini Settings</h3>
                  <p className="text-sm text-muted-foreground">Manage Gemini API key</p>
                </div>
                <Button
                  onClick={isEditingGemini ? handleGeminiUpdate : handleGeminiEdit}
                  className={`
                    transition-all duration-300 
                    ${
                      isEditingGemini
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "bg-accent/10 hover:bg-accent/20 text-accent"
                    }
                  `}
                >
                  {isEditingGemini ? <Save className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                  {isEditingGemini ? "Save Changes" : "Edit Settings"}
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Gemini API Key</label>
                <div className="relative">
                  <Input
                    type="text"
                    value={isEditingGemini ? actualGeminiKey : geminiKey}
                    onChange={(e) => setActualGeminiKey(e.target.value)}
                    disabled={!isEditingGemini}
                    className="bg-background/50 border-border/50 focus-visible:ring-primary/30 focus-visible:border-primary pr-10"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </TabsContent>

            {/* Stripe Tab Content */}
            <TabsContent value="stripe" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Stripe Settings</h3>
                  <p className="text-sm text-muted-foreground">Manage Stripe API key and webhook secret</p>
                </div>
                <Button
                  onClick={isEditingStripe ? handleStripeUpdate : handleStripeEdit}
                  className={`
                    transition-all duration-300 
                    ${
                      isEditingStripe
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "bg-accent/10 hover:bg-accent/20 text-accent"
                    }
                  `}
                >
                  {isEditingStripe ? <Save className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                  {isEditingStripe ? "Save Changes" : "Edit Settings"}
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Stripe API Key</label>
                <div className="relative">
                  <Input
                    type="text"
                    value={isEditingStripe ? actualStripeKey : stripeKey}
                    onChange={(e) => setActualStripeKey(e.target.value)}
                    disabled={!isEditingStripe}
                    className="bg-background/50 border-border/50 focus-visible:ring-primary/30 focus-visible:border-primary pr-10"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">Your Stripe secret key for payment processing.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Webhook Secret</label>
                <div className="relative">
                  <Input
                    type="text"
                    value={isEditingStripe ? actualStripeWebhookSecret : stripeWebhookSecret}
                    onChange={(e) => setActualStripeWebhookSecret(e.target.value)}
                    disabled={!isEditingStripe}
                    className="bg-background/50 border-border/50 focus-visible:ring-primary/30 focus-visible:border-primary pr-10"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Your Stripe webhook signing secret for verifying webhook events.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default ApiSettings
