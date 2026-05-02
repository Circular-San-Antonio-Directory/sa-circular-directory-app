-- CreateTable
CREATE TABLE "business_actions" (
    "id" SERIAL NOT NULL,
    "airtable_id" VARCHAR(50) NOT NULL,
    "action" VARCHAR(200) NOT NULL,
    "corresponding_action" VARCHAR(100),
    "display_order" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "icon_file" VARCHAR(50),
    "colorway" VARCHAR(50),

    CONSTRAINT "business_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_activities" (
    "id" SERIAL NOT NULL,
    "airtable_id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_types" (
    "id" SERIAL NOT NULL,
    "airtable_id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "businesses" (
    "id" SERIAL NOT NULL,
    "airtable_id" VARCHAR(50) NOT NULL,
    "business_name" VARCHAR(255),
    "business_description" TEXT,
    "address" TEXT,
    "business_email" VARCHAR(255),
    "business_phone" VARCHAR(50),
    "website" VARCHAR(500),
    "contact_name" VARCHAR(255),
    "contact_email" VARCHAR(255),
    "contacted_by" VARCHAR(100),
    "instagram_url_1" VARCHAR(500),
    "instagram_url_2" VARCHAR(500),
    "facebook_url" VARCHAR(500),
    "linkedin_url" VARCHAR(500),
    "google_hours_accurate" VARCHAR(50),
    "business_hours" TEXT,
    "business_type_ids" INTEGER[],
    "tag_ids" INTEGER[],
    "input_action_ids" INTEGER[],
    "output_action_ids" INTEGER[],
    "service_action_ids" INTEGER[],
    "input_category_ids" INTEGER[],
    "output_category_ids" INTEGER[],
    "service_category_ids" INTEGER[],
    "core_material_ids" INTEGER[],
    "enabling_system_ids" INTEGER[],
    "activity_ids" INTEGER[],
    "input_notes" TEXT,
    "input_category_override" TEXT,
    "output_notes" TEXT,
    "output_category_override" TEXT,
    "service_notes" TEXT,
    "service_category_override" TEXT,
    "listing_photo_url" VARCHAR(500),
    "has_delivery" BOOLEAN DEFAULT false,
    "has_pickup" BOOLEAN DEFAULT false,
    "has_online_shop" BOOLEAN DEFAULT false,
    "online_shop_link" VARCHAR(500),
    "volunteer_opportunities" BOOLEAN DEFAULT false,
    "volunteer_notes" TEXT,
    "airtable_created_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "geocoded_at" TIMESTAMPTZ(6),
    "hours_json" JSONB,
    "tiktok_handle" VARCHAR(500),

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "airtable_id" VARCHAR(50) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "items" TEXT,
    "fa_icon" VARCHAR(100),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_material_systems" (
    "id" SERIAL NOT NULL,
    "airtable_id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "core_material_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enabling_systems" (
    "id" SERIAL NOT NULL,
    "airtable_id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enabling_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "airtable_id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "business_actions_airtable_id_key" ON "business_actions"("airtable_id");

-- CreateIndex
CREATE INDEX "idx_business_actions_action" ON "business_actions"("action");

-- CreateIndex
CREATE INDEX "idx_business_actions_airtable_id" ON "business_actions"("airtable_id");

-- CreateIndex
CREATE UNIQUE INDEX "business_activities_airtable_id_key" ON "business_activities"("airtable_id");

-- CreateIndex
CREATE INDEX "idx_business_activities_airtable_id" ON "business_activities"("airtable_id");

-- CreateIndex
CREATE INDEX "idx_business_activities_name" ON "business_activities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "business_types_airtable_id_key" ON "business_types"("airtable_id");

-- CreateIndex
CREATE INDEX "idx_business_types_airtable_id" ON "business_types"("airtable_id");

-- CreateIndex
CREATE INDEX "idx_business_types_name" ON "business_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "businesses_airtable_id_key" ON "businesses"("airtable_id");

-- CreateIndex
CREATE INDEX "idx_businesses_activity_ids" ON "businesses" USING GIN ("activity_ids");

-- CreateIndex
CREATE INDEX "idx_businesses_airtable_id" ON "businesses"("airtable_id");

-- CreateIndex
CREATE INDEX "idx_businesses_business_email" ON "businesses"("business_email");

-- CreateIndex
CREATE INDEX "idx_businesses_business_name" ON "businesses"("business_name");

-- CreateIndex
CREATE INDEX "idx_businesses_business_type_ids" ON "businesses" USING GIN ("business_type_ids");

-- CreateIndex
CREATE INDEX "idx_businesses_core_material_ids" ON "businesses" USING GIN ("core_material_ids");

-- CreateIndex
CREATE INDEX "idx_businesses_enabling_system_ids" ON "businesses" USING GIN ("enabling_system_ids");

-- CreateIndex
CREATE INDEX "idx_businesses_input_action_ids" ON "businesses" USING GIN ("input_action_ids");

-- CreateIndex
CREATE INDEX "idx_businesses_input_category_ids" ON "businesses" USING GIN ("input_category_ids");

-- CreateIndex
CREATE INDEX "idx_businesses_output_action_ids" ON "businesses" USING GIN ("output_action_ids");

-- CreateIndex
CREATE INDEX "idx_businesses_output_category_ids" ON "businesses" USING GIN ("output_category_ids");

-- CreateIndex
CREATE INDEX "idx_businesses_service_action_ids" ON "businesses" USING GIN ("service_action_ids");

-- CreateIndex
CREATE INDEX "idx_businesses_service_category_ids" ON "businesses" USING GIN ("service_category_ids");

-- CreateIndex
CREATE INDEX "idx_businesses_tag_ids" ON "businesses" USING GIN ("tag_ids");

-- CreateIndex
CREATE UNIQUE INDEX "categories_airtable_id_key" ON "categories"("airtable_id");

-- CreateIndex
CREATE INDEX "idx_categories_airtable_id" ON "categories"("airtable_id");

-- CreateIndex
CREATE INDEX "idx_categories_category" ON "categories"("category");

-- CreateIndex
CREATE UNIQUE INDEX "core_material_systems_airtable_id_key" ON "core_material_systems"("airtable_id");

-- CreateIndex
CREATE INDEX "idx_core_material_systems_airtable_id" ON "core_material_systems"("airtable_id");

-- CreateIndex
CREATE INDEX "idx_core_material_systems_name" ON "core_material_systems"("name");

-- CreateIndex
CREATE UNIQUE INDEX "enabling_systems_airtable_id_key" ON "enabling_systems"("airtable_id");

-- CreateIndex
CREATE INDEX "idx_enabling_systems_airtable_id" ON "enabling_systems"("airtable_id");

-- CreateIndex
CREATE INDEX "idx_enabling_systems_name" ON "enabling_systems"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_airtable_id_key" ON "tags"("airtable_id");

-- CreateIndex
CREATE INDEX "idx_tags_airtable_id" ON "tags"("airtable_id");

-- CreateIndex
CREATE INDEX "idx_tags_name" ON "tags"("name");
