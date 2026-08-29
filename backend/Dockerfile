FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

COPY backend.csproj ./
RUN dotnet restore

COPY . ./

RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

RUN mkdir -p /app/wwwroot

COPY --from=build /app/out ./

EXPOSE 80

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:80

ENTRYPOINT ["dotnet", "backend.dll"]
