import { Body, Controller, Delete, Get, Param, Patch, Post, Put, StreamableFile, UseGuards } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { createRiskCategoryReq, createRiskCategoryRes, disabledCategoryReq, disabledCategoryRes, getRiskCategory } from 'DTO/risk-category.dto';
import { RiskCategory } from 'entities/risk-category.entity';
import { createReadStream } from 'fs';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
@ApiTags('Risk Categories')
@Controller('risk-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RiskCategoriesController {
  constructor(
    @InjectRepository(RiskCategory)
    public riskcatRepository: Repository<RiskCategory>,
  ) {}
  @ApiCreatedResponse({
    description: '',
    type: [getRiskCategory],
  })
  @Get()
  get() {
    return this.riskcatRepository.createQueryBuilder('riskCat')
    .leftJoinAndSelect('riskCat.category_group', 'category_group')
    .select([
      'riskCat.id AS id',
      'riskCat.title AS title',
      'riskCat.description AS description',
      'riskCat.disabled AS disabled',
      'category_group.id AS category_group_id',
      'category_group.name AS category_group_name',
      'category_group.description AS category_group_description'
        ])
    .orderBy('riskCat.title', 'ASC')
    .getRawMany()
  }
  @Roles(Role.Admin)
  @Put()
  @ApiCreatedResponse({
    description: '',
    type: createRiskCategoryReq,
  })
  @ApiBody({ type: createRiskCategoryReq})
  updateCategory(@Body() data: any) {
    const category = this.riskcatRepository.create();
    Object.assign(category, data);
    return this.riskcatRepository.save(category, { reload: true });
  }
  @Roles(Role.Admin)
  @Post()
  @ApiCreatedResponse({
    description: '',
    type: createRiskCategoryRes,
  })
  @ApiBody({ type: createRiskCategoryReq})
  async addCategory(@Body() data: any) {
    const category = this.riskcatRepository.create();
    Object.assign(category, data);
    await this.riskcatRepository.save(category, { reload: true });

    return category;
  }
  @Roles(Role.Admin)
  @Delete(':id')
  deleteCategory(@Param('id') id:number) {
    return this.riskcatRepository.delete(id)
  }
  @Roles(Role.Admin)
  @Patch()
  @ApiCreatedResponse({
    description: '',
    type: disabledCategoryRes,
  })
  @ApiBody({ type: disabledCategoryReq})
  async disabledCategory(@Body() data: any) {
    const category = await this.riskcatRepository.findOne({ where : { id : data.item.id } });
    if(data.act.action == 'disabledCatigory') {
      category.disabled = false;
      await this.riskcatRepository.save(category);
      return true
    }
    else {
      category.disabled = true;
      await this.riskcatRepository.save(category);
      return true
    }

  }
  @Roles(Role.Admin)
  @Get('export/all')
  @ApiCreatedResponse({
    description: '',
    type: [createRiskCategoryRes],
  })
  async export() {
    let categories = await this.riskcatRepository.find();

    const file_name = 'All-Users.xlsx';
    var wb = XLSX.utils.book_new();

    const ws = XLSX.utils.json_to_sheet(categories);

    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    await XLSX.writeFile(wb, join(process.cwd(), 'generated_files', file_name));
    const file = createReadStream(
      join(process.cwd(), 'generated_files', file_name),
    );

    setTimeout(async () => {
      try {
        await unlink(join(process.cwd(), 'generated_files', file_name));
      } catch (e) {}
    }, 9000);
    return new StreamableFile(file, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: `attachment; filename="${file_name}"`,
    });
  }
}
