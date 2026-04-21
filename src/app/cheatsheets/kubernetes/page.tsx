import type { Metadata } from 'next';
import { CheatsheetLayout } from '@/components/CheatsheetLayout';

export const metadata: Metadata = {
  title: 'Cheatsheet Kubernetes — FFV Academy',
  description: 'Kubernetes diário: kubectl essencial, YAML mínimo por resource, troubleshooting, RBAC, NetworkPolicy.',
  keywords: 'cheatsheet kubernetes, kubectl cheat, yaml k8s, troubleshooting k8s, rbac kubernetes',
};

export default function Page() {
  return (
    <CheatsheetLayout
      title="Kubernetes diário"
      subtitle="kubectl + YAML mínimo que você usa todo dia — sem abrir doc."
      accent="#326ce5"
      emoji="☸️"
    >
      <section>
        <h2>kubectl essencial</h2>
        <pre><code>{`kubectl get pods -A                          # tudo, todos namespaces
kubectl get pods -n prod -l app=api          # filtro por label
kubectl get pods -o wide                     # inclui node e IP
kubectl describe pod POD                     # events + state
kubectl logs POD -f --tail=100              # follow + últimas 100
kubectl logs POD --previous                  # container anterior (crash)
kubectl exec -it POD -- /bin/sh              # shell interativo
kubectl port-forward pod/POD 8080:80        # tunnel local
kubectl cp POD:/path/file ./file             # copiar arquivo
kubectl rollout status deploy/api            # rollout em progresso
kubectl rollout undo deploy/api              # desfazer último deploy
kubectl scale deploy/api --replicas=5
kubectl top nodes / kubectl top pods         # CPU/mem em tempo real`}</code></pre>
      </section>

      <section>
        <h2>Deployment mínimo</h2>
        <pre><code>{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector: { matchLabels: { app: api } }
  template:
    metadata: { labels: { app: api } }
    spec:
      containers:
      - name: api
        image: ghcr.io/org/api:v1.2.3
        resources:
          requests: { cpu: 100m, memory: 128Mi }
          limits:   { cpu: 500m, memory: 512Mi }
        livenessProbe:
          httpGet: { path: /health, port: 8080 }
          periodSeconds: 10
        readinessProbe:
          httpGet: { path: /ready, port: 8080 }
          initialDelaySeconds: 5
        env:
        - name: DB_URL
          valueFrom: { secretKeyRef: { name: db, key: url } }`}</code></pre>
      </section>

      <section>
        <h2>Service + Ingress</h2>
        <pre><code>{`apiVersion: v1
kind: Service
metadata: { name: api }
spec:
  selector: { app: api }
  ports: [{ port: 80, targetPort: 8080 }]
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt
spec:
  tls: [{ hosts: [api.example.com], secretName: api-tls }]
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend: { service: { name: api, port: { number: 80 } } }`}</code></pre>
      </section>

      <section>
        <h2>ConfigMap + Secret</h2>
        <pre><code>{`kubectl create configmap app-config --from-literal=LEVEL=info
kubectl create secret generic db --from-literal=url=postgres://...
kubectl create secret tls api-tls --cert=tls.crt --key=tls.key

# Montar como volume:
volumes:
- name: config
  configMap: { name: app-config }`}</code></pre>
      </section>

      <section>
        <h2>Troubleshooting</h2>
        <pre><code>{`# Pod Pending
kubectl describe pod POD  # → Events: FailedScheduling?
#  "Insufficient cpu/memory" → escalar cluster
#  "node(s) had taints"      → toleration/taint mismatch
#  "0/3 nodes match selector" → nodeSelector/affinity

# Pod CrashLoopBackOff
kubectl logs POD --previous   # output do crash
kubectl describe pod POD      # exit code, last state

# Image Pull
# ErrImagePull / ImagePullBackOff → imagem errada ou sem pull secret
kubectl create secret docker-registry regcred --docker-server=... --docker-username=... --docker-password=...

# PVC Pending
kubectl get sc; kubectl describe pvc PVC  # storage class + events`}</code></pre>
      </section>

      <section>
        <h2>RBAC mínimo</h2>
        <pre><code>{`apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata: { namespace: dev, name: pod-reader }
rules:
- apiGroups: [""]
  resources: ["pods", "pods/log"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata: { namespace: dev, name: dev-readers }
subjects:
- kind: ServiceAccount
  name: ci-reader
  namespace: dev
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io`}</code></pre>
      </section>

      <section>
        <h2>NetworkPolicy (default deny + allow explícito)</h2>
        <pre><code>{`# Default deny all ingress no namespace
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: default-deny, namespace: prod }
spec:
  podSelector: {}
  policyTypes: [Ingress]
---
# Allow apenas frontend → api
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: frontend-to-api, namespace: prod }
spec:
  podSelector: { matchLabels: { app: api } }
  ingress:
  - from:
    - podSelector: { matchLabels: { app: frontend } }
    ports: [{ port: 8080 }]`}</code></pre>
      </section>
    </CheatsheetLayout>
  );
}
