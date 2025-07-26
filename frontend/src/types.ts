export interface AudienceDetail {
  relevance_score: string;
  policies: string[];
  example: string;
}

export interface AnalysisResult {
  id: string; 
  filename: string;
  party_name?: string;
  summary: string;
  key_themes: string[];
  sentiment: string;
  analysis_for: {
    youth: AudienceDetail;
    seniors: AudienceDetail;
    farmers: AudienceDetail;
    corporate_sector: AudienceDetail;
  };
  // Optional translated versions
  [key: string]: any; // For dynamic translated_summary_* fields
}

export interface ComparisonResult {
  party_names: {
    party_a: string;
    party_b: string;
  };
  head_to_head: {
    economy: string;
    welfare_and_social_justice: string;
    agriculture: string;
    governance_and_democracy: string;
  };
  key_differentiators: string[];
  voter_appeal_analysis: string;
}
