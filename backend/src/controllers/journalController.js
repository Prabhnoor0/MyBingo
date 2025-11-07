const JournalEntry = require('../models/JournalEntry');
const { GoogleGenAI } = require('@google/genai');

// Init Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || undefined
});

exports.createJournal = async (req, res) => {
  try {
    const { title, content, mood, tags, isFavorite } = req.body;
    console.log('CREATE JOURNAL REQUEST:', { title, content, mood, tags, isFavorite, userId: req.user.id });
    
    const entry = await JournalEntry.create({
      user: req.user.id, 
      title,
      content,
      mood,
      tags,
      isFavorite
    });
    
    console.log('JOURNAL CREATED:', entry);
    res.status(201).json(entry);
  } catch (err) {
    console.error('JOURNAL CREATE ERROR:', err);
    res.status(400).json({ message: err.message });
  }
};

exports.getJournals = async (req, res) => {
  try {
    const entries = await JournalEntry.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getJournal = async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, user: req.user.id });
    if (!entry) return res.status(404).json({ message: 'Journal not found' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateJournal = async (req, res) => {
  try {
    const { title, content, mood, tags, isFavorite } = req.body;
    const entry = await JournalEntry.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title, content, mood, tags, isFavorite },
      { new: true }
    );
    if (!entry) return res.status(404).json({ message: 'Journal not found' });
    res.json(entry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteJournal = async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!entry) return res.status(404).json({ message: 'Journal not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// AI Journal Insights Endpoint
exports.analyzeJournal = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ message: 'Journal content is required' });
    }

    const SYSTEM_PROMPT = `
You are SageWillow — a warm, empathetic college wellness companion.
The user has shared their thoughts in a journal entry. Read it carefully, offer gentle emotional support, provide 1-2 constructive reflections or positive reframings, and suggest a simple, doable self-care activity (like a short breathing exercise or a glass of water).
Keep your response brief, friendly, and structured. Focus on validation and encouragement. Return 2-3 short, supportive bullet points or sentences.
`.trim();

    const prompt = `${SYSTEM_PROMPT}\n\nJournal Entry Content:\n"${content}"\n\nYour supportive reflection:`;

    const modelToUse = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: prompt,
    });

    const insightText = (response && (response.text || (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text))) || "SageWillow is listening and sends you a warm hug. Keep expressing yourself!";

    res.json({ insight: insightText });
  } catch (err) {
    console.error('AI Journal Analysis error:', err);
    res.status(500).json({ message: 'Failed to generate AI insights', error: err.message });
  }
};