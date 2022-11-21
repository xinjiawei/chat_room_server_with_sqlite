FROM denoland/deno:1.28.1
EXPOSE 7777
WORKDIR /app
USER root
COPY . .
RUN deno cache deps.ts
RUN deno cache main.ts
RUN chmod +x run.sh 
CMD ["./run.sh"] 