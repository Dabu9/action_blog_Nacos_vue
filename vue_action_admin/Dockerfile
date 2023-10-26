# 使用基础镜像
FROM registry.cn-shenzhen.aliyuncs.com/mogublog/nginx:latest

# 将本地构建产物复制到 Nginx 静态文件目录
ADD ./dist/ /usr/share/nginx/html

# 移除可能存在的 Windows 换行符
RUN sed -i 's/\r$//' /usr/share/nginx/html/env.sh

# 添加执行权限
RUN chmod +x /usr/share/nginx/html/env.sh

# 定义入口点脚本
ENTRYPOINT ["/usr/share/nginx/html/env.sh"]

# 启动 Nginx 并保持容器在前台运行
CMD ["nginx", "-g", "daemon off;"]

