using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class SimplifyRolesAndModuleAssistant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AIConversations_TrainingModules_TrainingModuleId",
                table: "AIConversations");

            migrationBuilder.DropForeignKey(
                name: "FK_Trainings_AspNetUsers_TrainerId",
                table: "Trainings");

            migrationBuilder.DropIndex(
                name: "IX_Trainings_TrainerId",
                table: "Trainings");

            migrationBuilder.DropColumn(
                name: "TrainerId",
                table: "Trainings");

            migrationBuilder.Sql(@"
                INSERT INTO TrainingModules (TrainingId, Title, Description, Content, OrderIndex, IsPublished, EstimatedDurationMinutes, CreatedAt)
                SELECT DISTINCT c.TrainingId, 'Conversation archive', 'Module technique cree pour conserver les conversations existantes sans module.', NULL, 1, 0, NULL, SYSUTCDATETIME()
                FROM AIConversations c
                WHERE c.TrainingModuleId IS NULL
                  AND NOT EXISTS (SELECT 1 FROM TrainingModules m WHERE m.TrainingId = c.TrainingId);

                UPDATE c
                SET TrainingModuleId = m.Id
                FROM AIConversations c
                CROSS APPLY (
                    SELECT TOP 1 Id
                    FROM TrainingModules
                    WHERE TrainingId = c.TrainingId
                    ORDER BY OrderIndex, Id
                ) m
                WHERE c.TrainingModuleId IS NULL;
            ");
            migrationBuilder.AlterColumn<int>(
                name: "TrainingModuleId",
                table: "AIConversations",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "ModuleContentChunks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TrainingModuleResourceId = table.Column<int>(type: "int", nullable: false),
                    TrainingModuleId = table.Column<int>(type: "int", nullable: false),
                    ChunkIndex = table.Column<int>(type: "int", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CharacterCount = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModuleContentChunks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModuleContentChunks_TrainingModuleResources_TrainingModuleResourceId",
                        column: x => x.TrainingModuleResourceId,
                        principalTable: "TrainingModuleResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ModuleContentChunks_TrainingModules_TrainingModuleId",
                        column: x => x.TrainingModuleId,
                        principalTable: "TrainingModules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ModuleContentChunks_TrainingModuleId",
                table: "ModuleContentChunks",
                column: "TrainingModuleId");

            migrationBuilder.CreateIndex(
                name: "IX_ModuleContentChunks_TrainingModuleResourceId_ChunkIndex",
                table: "ModuleContentChunks",
                columns: new[] { "TrainingModuleResourceId", "ChunkIndex" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AIConversations_TrainingModules_TrainingModuleId",
                table: "AIConversations",
                column: "TrainingModuleId",
                principalTable: "TrainingModules",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AIConversations_TrainingModules_TrainingModuleId",
                table: "AIConversations");

            migrationBuilder.DropTable(
                name: "ModuleContentChunks");

            migrationBuilder.AddColumn<string>(
                name: "TrainerId",
                table: "Trainings",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "TrainingModuleId",
                table: "AIConversations",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateIndex(
                name: "IX_Trainings_TrainerId",
                table: "Trainings",
                column: "TrainerId");

            migrationBuilder.AddForeignKey(
                name: "FK_AIConversations_TrainingModules_TrainingModuleId",
                table: "AIConversations",
                column: "TrainingModuleId",
                principalTable: "TrainingModules",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Trainings_AspNetUsers_TrainerId",
                table: "Trainings",
                column: "TrainerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}


