const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

exports.processMessage = async (req, res) => {
  try {
    const { message, conversation } = req.body;
    
    const messages = [
      {
        role: "assistant",
        content: "I am a helpful assistant for this mobile app. How can I help you today?"
      },
      ...conversation,
      { role: "user", content: message }
    ];

    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229", // Choose appropriate model
      max_tokens: 500,
      messages: messages
    });

    res.json({ 
      reply: response.content[0].text,
      usage: response.usage
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
};