import { NodeType, RelationType } from '@/types/graph';

// Keyword mappings for node type classification
export const NODE_TYPE_KEYWORDS: Record<NodeType, string[]> = {
  symptom: [
    "エラー", "error", "問題発生", "バグ", "bug", "失敗", "fail",
    "動かない", "表示されない", "タイムアウト", "timeout", "落ちる",
    "crash", "異常", "不具合", "障害", "遅い", "slow"
  ],
  cause: [
    "原因", "理由", "なぜなら", "because", "~が原因", "due to",
    "せいで", "caused by", "起因", "元凶", "根本", "root cause"
  ],
  hypothesis: [
    "たぶん", "おそらく", "もしかして", "maybe", "perhaps", "推測",
    "仮説", "かもしれない", "might", "possibly", "予想", "思われる",
    "疑い", "可能性", "probably"
  ],
  action: [
    "修正", "fix", "対応", "実装", "implement", "試す", "try",
    "テスト", "test", "確認", "check", "調査", "investigate",
    "デバッグ", "debug", "改善", "improve", "最適化", "optimize"
  ],
  state: [
    "完了", "done", "解決", "resolved", "済み", "クローズ", "closed",
    "finished", "完了しました", "解決しました", "修正済み", "fixed"
  ],
  info: [
    "情報", "メモ", "参考", "note", "FYI", "念のため", "補足",
    "ちなみに", "追加", "関連", "リンク", "link", "ドキュメント"
  ]
};

// Keyword mappings for relation classification
export const CAUSALITY_KEYWORDS: Record<RelationType, string[]> = {
  cause: [
    "原因", "せいで", "because", "due to", "から", "が原因",
    "によって", "caused by", "起因", "元で"
  ],
  correlate: [
    "関連", "同様", "similar", "また", "同じく", "合わせて",
    "関係", "つながり", "connection", "同じ", "似ている"
  ],
  leads_to: [
    "結果", "そのため", "therefore", "→", "次に", "続いて",
    "その後", "結論", "conclusion", "ゆえに", "したがって"
  ],
  duplicate: [
    "重複", "同じ", "duplicate", "same as", "既出", "同様の問題",
    "同一", "繰り返し", "again"
  ]
};

// Technical terms to extract as tags
export const TECH_KEYWORDS = [
  "API", "Firebase", "Firestore", "React", "Next.js", "Next", "TypeScript",
  "JavaScript", "Node.js", "npm", "Git", "GitHub", "Docker", "Kubernetes",
  "AWS", "GCP", "Azure", "MongoDB", "PostgreSQL", "MySQL", "Redis",
  "GraphQL", "REST", "HTTP", "HTTPS", "SSL", "TLS", "OAuth", "JWT",
  "SQL", "NoSQL", "Database", "DB", "Cache", "CDN", "DNS", "Load Balancer",
  "Nginx", "Apache", "Express", "FastAPI", "Django", "Flask", "Spring",
  "Tailwind", "CSS", "HTML", "DOM", "WebSocket", "SSE", "gRPC",
  "Microservices", "Monolith", "Serverless", "Lambda", "Cloud Functions",
  "CI/CD", "Jenkins", "GitHub Actions", "GitLab", "Bitbucket",
  "Terraform", "Ansible", "Chef", "Puppet", "Prometheus", "Grafana",
  "Elasticsearch", "Kibana", "Logstash", "Splunk", "DataDog", "NewRelic"
];
