import logger from '../lib/logger';
import { SentimentAnalysis } from '../lib/types';
import Sentiment from 'sentiment';

const sentiment = new Sentiment();

export class EmotionalContext {
  /**
   * Analyze sentiment of text
   */
  analyzeSentiment(text: string): SentimentAnalysis {
    try {
      const result = sentiment.analyze(text);

      const analysis: SentimentAnalysis = {
        score: result.score,
        comparative: result.comparative,
        tokens: result.tokens,
        positive: result.positive,
        negative: result.negative,
        label: this.getSentimentLabel(result.comparative),
      };

      logger.debug('Sentiment analyzed', {
        text: text.substring(0, 50),
        label: analysis.label,
        score: analysis.score,
      });

      return analysis;
    } catch (error) {
      logger.error('Failed to analyze sentiment', { error });
      return this.neutralSentiment();
    }
  }

  /**
   * Get sentiment label from score
   */
  private getSentimentLabel(comparative: number): 'positive' | 'negative' | 'neutral' {
    if (comparative > 0.1) return 'positive';
    if (comparative < -0.1) return 'negative';
    return 'neutral';
  }

  /**
   * Extract emotional context from observation
   */
  extractEmotionalContext(payload: Record<string, any>): Record<string, any> {
    const context: Record<string, any> = {};

    // Analyze text fields
    const textFields = ['message', 'description', 'content', 'text', 'body'];
    
    for (const field of textFields) {
      if (payload[field] && typeof payload[field] === 'string') {
        const sentiment = this.analyzeSentiment(payload[field]);
        context[`${field}_sentiment`] = sentiment;
      }
    }

    // Detect urgency indicators
    context.urgency = this.detectUrgency(payload);

    // Detect emotional tone
    context.tone = this.detectTone(payload);

    return context;
  }

  /**
   * Detect urgency in text
   */
  private detectUrgency(payload: Record<string, any>): 'high' | 'medium' | 'low' {
    const urgentWords = [
      'urgent', 'critical', 'emergency', 'asap', 'immediately',
      'now', 'quickly', 'priority', 'important', 'severe'
    ];

    const textContent = JSON.stringify(payload).toLowerCase();
    const urgentCount = urgentWords.filter(word => textContent.includes(word)).length;

    if (urgentCount >= 3) return 'high';
    if (urgentCount >= 1) return 'medium';
    return 'low';
  }

  /**
   * Detect emotional tone
   */
  private detectTone(payload: Record<string, any>): string[] {
    const tones: string[] = [];
    const textContent = JSON.stringify(payload).toLowerCase();

    const tonePatterns: Record<string, string[]> = {
      angry: ['angry', 'frustrated', 'annoyed', 'furious', 'mad'],
      concerned: ['concerned', 'worried', 'anxious', 'nervous'],
      confident: ['confident', 'certain', 'sure', 'positive'],
      confused: ['confused', 'unclear', 'unsure', 'uncertain'],
      satisfied: ['satisfied', 'happy', 'pleased', 'glad'],
    };

    for (const [tone, patterns] of Object.entries(tonePatterns)) {
      if (patterns.some(pattern => textContent.includes(pattern))) {
        tones.push(tone);
      }
    }

    return tones;
  }

  /**
   * Aggregate sentiment across multiple texts
   */
  aggregateSentiment(texts: string[]): SentimentAnalysis {
    if (texts.length === 0) return this.neutralSentiment();

    const analyses = texts.map(text => this.analyzeSentiment(text));
    
    const avgScore = analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length;
    const avgComparative = analyses.reduce((sum, a) => sum + a.comparative, 0) / analyses.length;
    
    const allPositive = analyses.flatMap(a => a.positive);
    const allNegative = analyses.flatMap(a => a.negative);
    const allTokens = analyses.flatMap(a => a.tokens);

    return {
      score: avgScore,
      comparative: avgComparative,
      tokens: allTokens,
      positive: [...new Set(allPositive)],
      negative: [...new Set(allNegative)],
      label: this.getSentimentLabel(avgComparative),
    };
  }

  /**
   * Detect sentiment shift over time
   */
  detectSentimentShift(sentiments: Array<{ timestamp: Date; sentiment: SentimentAnalysis }>): {
    hasShift: boolean;
    direction: 'improving' | 'deteriorating' | 'stable';
    magnitude: number;
  } {
    if (sentiments.length < 2) {
      return { hasShift: false, direction: 'stable', magnitude: 0 };
    }

    const scores = sentiments.map(s => s.sentiment.comparative);
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));

    const firstAvg = firstHalf.reduce((sum, s) => sum + s, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, s) => sum + s, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;
    const magnitude = Math.abs(diff);

    let direction: 'improving' | 'deteriorating' | 'stable';
    if (magnitude < 0.1) {
      direction = 'stable';
    } else if (diff > 0) {
      direction = 'improving';
    } else {
      direction = 'deteriorating';
    }

    return {
      hasShift: magnitude >= 0.1,
      direction,
      magnitude,
    };
  }

  /**
   * Return neutral sentiment
   */
  private neutralSentiment(): SentimentAnalysis {
    return {
      score: 0,
      comparative: 0,
      tokens: [],
      positive: [],
      negative: [],
      label: 'neutral',
    };
  }
}
