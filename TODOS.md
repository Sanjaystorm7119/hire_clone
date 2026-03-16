--fix interview on deployment ✔️
--add resume parser ✔️
--add job parser ✔️
--add jobs ✔️
--RBAC for users / admin/recruiters 



## RAG 
Phase 1 : LLM-to-filter chatbot using your existing Supabase data. Add a POST /api/recruiter-chat route - pass the natural language query + schema to Gemini, get back a filter object, reuse your existing resume query logic.

Phase 2 : Add vector embeddings (pgvector on Supabase) on experience_summary + skills for semantic search - "find someone with a background similar to our last great hire."