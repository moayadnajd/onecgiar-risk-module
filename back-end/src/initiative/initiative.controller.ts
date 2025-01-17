import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { InitiativeRoles } from 'entities/initiative-roles.entity';
import { Initiative } from 'entities/initiative.entity';
import { InitiativeService } from './initiative.service';
import * as XLSX from 'xlsx';
import { join } from 'path';
import { createReadStream } from 'fs';
import { RiskService } from 'src/risk/risk.service';
import {
  DataSource,
  ILike,
  In,
  IsNull,
  LessThan,
  MoreThan,
  Not,
  createQueryBuilder,
} from 'typeorm';
import { unlink } from 'fs/promises';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';
import { Risk } from 'entities/risk.entity';
import { AllExcel, TopSimilar, createRoleReq, createRoleRes, createVersion, deleteRoleRes, getAllCategories, getAllVersions, getInitiative, getInitiativeById, getRoles, reqBodyCreateVersion, updateRoleReq, updateRoleRes } from 'DTO/initiative.dto';
import { RiskCategory } from 'entities/risk-category.entity';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { RolesGuard } from 'src/auth/roles.guard';
@ApiTags('Initiative')
@Controller('initiative')
@UseGuards(JwtAuthGuard)
export class InitiativeController {
  constructor(
    private iniService: InitiativeService,
    private riskService: RiskService,
    private dataSource: DataSource,
  ) {}

  offical(query) {
    if (query.initiative_id != null) {
      if (query.initiative_id.charAt(0) == '0') {
        const id = query.initiative_id.substring(1);
        if (id <= 9) {
          return 'INIT-0' + id;
        }
      } else {
        if (query.initiative_id <= 9) {
          return 'INIT-0' + query.initiative_id;
        } else {
          return 'INIT-' + query.initiative_id;
        }
      }
    }
    return query.initiative_id;
  }
  roles(query, req) {
    if (query?.my_role)
      return { roles: { user_id: req.user.id, role: query?.my_role } };
    else if (query?.my_ini == 'true')
      return { roles: { user_id: req.user.id } };
    else return {};
  }
  sort(query) {
    if (query?.sort) {
      let obj = {};
      const sorts = query.sort.split(',');
      obj[sorts[0]] = sorts[1];
      return obj;
    } else return { id: 'ASC' };
  }

  @Get('import-file')
  async importFile() {
    const workbook = XLSX.readFile(
      join(process.cwd(), 'Initiatives all risks.xlsx'),
    );

    const data: any = XLSX.utils.sheet_to_json(workbook.Sheets['2023 Update']);

    for (let row of data) {
      row['Current Impact'] = +row['Current Impact'];
      row['Current Likelihood'] = +row['Current Likelihood'];
      row['code'] = +row['INIT'].replace(/^\D+/g, '');
      row['title'] =
        row[
          'Top 5 risks to achieving impact \r\n(note relevant Work Package numbers in brackets)'
        ];
      row['description'] = row['Description of risk (50 words max each)'];
      if (row['Skip'] != '1') {
        let risk = this.riskService.riskRepository.create();
      
        risk.description = row['description'];
        risk.current_impact = row['Current Impact'];
        risk.current_likelihood = row['Current Likelihood'];
        risk.target_likelihood = 0
        risk.target_impact = 0
        risk.title = row['title'];
if(row['title'].length >= 255){
row['title'] = row['title'].trim().substring(0, 254);
risk.title = row['title'];
}
        const risk_category = await this.dataSource
          .createQueryBuilder()
          .addFrom(RiskCategory, RiskCategory.name)
          .where({ title: row['New categories mapping'] })
          .execute();
        risk.category_id = risk_category[0].id;

        const initiative = await this.iniService.iniRepository.findOne({
          where: {
            parent_id: IsNull(),
            official_code:
              row.code <= 9 ? `INIT-0${row.code}` : `INIT-${row.code}`,
          },
        });
        risk.initiative_id = initiative.id;
        await this.riskService.riskRepository.save(risk);
      }
    }

    return data;
  }
  @Get()
  @ApiCreatedResponse({
    description: '',
    type: [getInitiative],
  })
  getInitiative(@Query() query: any, @Req() req) {
    return this.iniService.iniRepository.find({
      where: {
        name: query?.name ? ILike(`%${query.name}%`) : null,
        parent_id: IsNull(),
        official_code: this.offical(query),
        ...this.roles(query, req),
        risks: { category_id: query?.category },
        status: query.status,
      },
      relations: [
        'risks',
        'risks.category',
        'risks.risk_owner',
        'roles',
        'roles.user',
      ],
      order: { ...this.sort(query), risks: { id: 'DESC', top: 'ASC' } },
    });
  }
  getTemplateAdmin(width = false) {
    return {
      // 'top': null,
      ID: null,
      Initiative: null,
      Title: null,
      Description: null,
      'Risk owner': null,
      'Target likelihood': null,
      'Target impact': null,
      'Target Risk Level': null,
      'Current likelihood': null,
      'Current impact': null,
      'Current Risk Level': null,
      Category: null,
      'Created by': null,
      Flagged: null,
      'Due date': null,
      // Redundant: false,
      Mitigations: width ? 'Description' : null,
      mitigations_status: width ? 'Status' : null,
    };
  }

  mapTemplateAdmin(template, element) {
    // template['top'] = element.top == 999 ? '' : element.top;
    template.ID = element.original_risk_id == null ? element.id : element.original_risk_id;
    template.Title = element.title;
    template.Initiative = element.initiative.official_code;
    template.Description = element.description;
    template['Risk owner'] = element.risk_owner?.user?.full_name;
    template['Target likelihood'] = element.target_likelihood;
    template['Target impact'] = element.target_impact;
    template['Target Risk Level'] =
      element.target_likelihood * element.target_impact;
    template['Current likelihood'] = element.current_likelihood;
    template['Current impact'] = element.current_impact;
    template['Current Risk Level'] =
      element.current_likelihood * element.current_impact;
    template.Category = element.category.title;
    template['Created by'] = element.created_by?.full_name;
    // template.Redundant = element.redundant;
    template['Due date'] =
      element.due_date === null
        ? 'null'
        : new Date(element.due_date).toLocaleDateString();
    template['Flagged'] = element.flag;
  }

  prepareDataExcelAdmin(risks) {
    let finaldata = [this.getTemplateAdmin(true)];
    let merges = [
      {
        s: { c: 15, r: 0 },
        e: { c: 17, r: 0 },
      },
    ];
    for (let index = 0; index < 15; index++) {
      merges.push({
        s: { c: index, r: 0 },
        e: { c: index, r: 1 },
      });
    }
    let base = 2;
    risks.forEach((element, indexbase) => {
      const template = this.getTemplateAdmin();
      this.mapTemplateAdmin(template, element);
      if (element.mitigations.length) {
        for (let index = 0; index < 15; index++) {
          merges.push({
            s: { c: index, r: base },
            e: { c: index, r: base + element.mitigations.length - 1 },
          });
        }
        base += element.mitigations.length;
      } else {
        finaldata.push(template);
        base += 1;
      }
      element.mitigations.forEach((d, index) => {
        if (index == 0) {
          template.Mitigations = d.description;
          template.mitigations_status = d.status.title;
          finaldata.push(template);
        } else {
          const template2 = this.getTemplateAdmin();
          template2.Mitigations = d.description;
          template2.mitigations_status = d.status.title;
          finaldata.push(template2);
        }
      });
    });
    return { finaldata, merges };
  }





  getTemplateAllDataAdmin(width = false) {
    return {
      // 'top': null,
      ID: null,
      Initiative: null,
      Title: null,
      Description: null,
      'Risk owner': null,
      'Target likelihood': null,
      'Target impact': null,
      'Target Risk Level': null,
      'Current likelihood': null,
      'Current impact': null,
      'Current Risk Level': null,

      Category: null,
      'Created by': null,
      Flagged: null,
      'Due date': null,
      // Redundant: false,
      Mitigations: width ? 'Description' : null,
      mitigations_status: width ? 'Status' : null,
      'Help requested': null,

    };
  }




  mapTemplateAllDataAdmin(template, element) {
    // template['top'] = element.top == 999 ? '' : element.top;

    template.ID = element.original_risk_id == null ? element.id : element.original_risk_id;
    template.Title = element.title;
    template.Initiative = element.initiative.official_code;
    template.Description = element.description;
    template['Risk owner'] = element.risk_owner?.user?.full_name;
    template['Target likelihood'] = element.target_likelihood;
    template['Target impact'] = element.target_impact;
    template['Target Risk Level'] =
      element.target_likelihood * element.target_impact;
    template['Current likelihood'] = element.current_likelihood;
    template['Current impact'] = element.current_impact;
    template['Current Risk Level'] =
      element.current_likelihood * element.current_impact;

    template.Category = element.category.title;
    template['Created by'] = element.created_by?.full_name;
    // template.Redundant = element.redundant;
    template['Due date'] =
      element.due_date === null
        ? 'null'
        : new Date(element.due_date).toLocaleDateString();
    template['Flagged'] = element.flag;
    template['Help requested'] = element.request_assistance == true ? 'Yes' : 'No';

  }






  prepareAllDataExcelAdmin(risks) {
    let finaldata = [this.getTemplateAllDataAdmin(true)];
    let merges = [
      {
        s: { c: 16, r: 0 },
        e: { c: 15, r: 0 },
      },
    ];
    for (let index = 0; index < 16; index++) {
      merges.push({
        s: { c: index, r: 0 },
        e: { c: index, r: 1 },
      });
    }


    let base = 2;
    risks.forEach((element, indexbase) => {
      const template = this.getTemplateAllDataAdmin();
      this.mapTemplateAllDataAdmin(template, element);
      if (element.mitigations.length) {
        
        for (let index = 0; index < 16; index++) {
          merges.push({
            s: { c: index, r: base },
            e: { c: index, r: base + element.mitigations.length - 1 },
          });
        }
        base += element.mitigations.length;
      } else {
        finaldata.push(template);
        base += 1;
      }
      element.mitigations.forEach((d, index) => {
        console.log(index)
        if (index == 0) {
          template.Mitigations = d.description;
          template.mitigations_status = d.status.title;
          finaldata.push(template);
        } else {
          const template2 = this.getTemplateAllDataAdmin();
          template2.Mitigations = d.description;
          template2.mitigations_status = d.status.title;
          finaldata.push(template2);
        }
      });
    });
    return { finaldata, merges };
  }
  getTemplateVersionAdmin(width = false) {
    return {
      'top': null,
      ID: null,
      Initiative: null,
      Title: null,
      Description: null,
      'Risk owner': null,
      'Target likelihood': null,
      'Target impact': null,
      'Target Risk Level': null,
      'Current likelihood': null,
      'Current impact': null,
      'Current Risk Level': null,
      Category: null,
      'Created by': null,
      Flagged: null,
      'Due date': null,
      // Redundant: false,
      Mitigations: width ? 'Description' : null,
      mitigations_status: width ? 'Status' : null,
    };
  }


  mapTemplateVersionAdmin(template, element) {
    template['top'] = element.top == 999 ? '' : element.top;
    template.ID = element.original_risk_id == null ? element.id : element.original_risk_id;
    template.Title = element.title;
    template.Initiative = element.initiative.official_code;
    template.Description = element.description;
    template['Risk owner'] = element.risk_owner?.user?.full_name;
    template['Target likelihood'] = element.target_likelihood;
    template['Target impact'] = element.target_impact;
    template['Target Risk Level'] =
      element.target_likelihood * element.target_impact;
    template['Current likelihood'] = element.current_likelihood;
    template['Current impact'] = element.current_impact;
    template['Current Risk Level'] =
      element.current_likelihood * element.current_impact;
    template.Category = element.category.title;
    template['Created by'] = element.created_by?.full_name;
    // template.Redundant = element.redundant;
    template['Due date'] =
      element.due_date === null
        ? 'null'
        : new Date(element.due_date).toLocaleDateString();
    template['Flagged'] = element.flag;
  }



  prepareDataExcelVersionAdmin(risks) {
    let finaldata = [this.getTemplateVersionAdmin(true)];
    let merges = [
      {
        s: { c: 16, r: 0 },
        e: { c: 17, r: 0 },
      },
    ];
    for (let index = 0; index < 16; index++) {
      merges.push({
        s: { c: index, r: 0 },
        e: { c: index, r: 1 },
      });
    }
    let base = 2;
    risks.forEach((element, indexbase) => {
      const template = this.getTemplateVersionAdmin();
      this.mapTemplateVersionAdmin(template, element);
      if (element.mitigations.length) {
        for (let index = 0; index < 15; index++) {
          merges.push({
            s: { c: index, r: base },
            e: { c: index, r: base + element.mitigations.length - 1 },
          });
        }
        base += element.mitigations.length;
      } else {
        finaldata.push(template);
        base += 1;
      }
      element.mitigations.forEach((d, index) => {
        if (index == 0) {
          template.Mitigations = d.description;
          template.mitigations_status = d.status.title;
          finaldata.push(template);
        } else {
          const template2 = this.getTemplateVersionAdmin();
          template2.Mitigations = d.description;
          template2.mitigations_status = d.status.title;
          finaldata.push(template2);
        }
      });
    });
    return { finaldata, merges };
  }

  getTemplateUser(width = false) {
    return {
      ID: null,
      Initiative: null,
      Title: null,
      Description: null,
      'Risk owner': null,
      'Target likelihood': null,
      'Target impact': null,
      'Target Risk Level': null,
      'Current likelihood': null,
      'Current impact': null,
      'Current Risk Level': null,
      Category: null,
      'Created by': null,
      // "Flag to SGD":null,
      'Due Date': null,
      // Redundant: false,
      Mitigations: width ? 'Description' : null,
      mitigations_status: width ? 'Status' : null,
    };
  }

  mapTemplateUser(template, element) {
    template.ID = element.original_risk_id == null ? element.id : element.original_risk_id;
    template.Title = element.title;
    template.Initiative = element.initiative.official_code;
    template.Description = element.description;
    template['Risk owner'] = element.risk_owner?.user?.full_name;
    template['Target likelihood'] = element.target_likelihood;
    template['Target impact'] = element.target_impact;
    template['Target Risk Level'] =
      element.target_likelihood * element.target_impact;
    template['Current likelihood'] = element.current_likelihood;
    template['Current impact'] = element.current_impact;
    template['Current Risk Level'] =
      element.current_likelihood * element.current_impact;
    template.Category = element.category.title;
    template['Created by'] = element.created_by?.full_name;
    template['Due Date'] =
      element.due_date === null
        ? 'null'
        : new Date(element.due_date).toLocaleDateString();
    // template.Redundant = element.redundant;
    // template['Flag to SGD'] = element.flag;
  }

  prepareDataExcelUser(risks) {
    let finaldata = [this.getTemplateUser(true)];
    let merges = [
      {
        s: { c: 14, r: 0 },
        e: { c: 16, r: 0 },
      },
    ];
    for (let index = 0; index < 14; index++) {
      merges.push({
        s: { c: index, r: 0 },
        e: { c: index, r: 1 },
      });
      // console.log(merges[0].s);
    }

    let base = 2;
    risks.forEach((element, indexbase) => {
      const template = this.getTemplateUser();
      this.mapTemplateUser(template, element);
      if (element.mitigations.length) {
        for (let index = 0; index < 14; index++) {
          merges.push({
            s: { c: index, r: base },
            e: { c: index, r: base + element.mitigations.length - 1 },
          });
        }
        base += element.mitigations.length;
      } else {
        finaldata.push(template);
        base += 1;
      }
      element.mitigations.forEach((d, index) => {
        if (index == 0) {
          template.Mitigations = d.description;
          template.mitigations_status = d.status.title;
          finaldata.push(template);
        } else {
          const template2 = this.getTemplateUser();
          template2.Mitigations = d.description;
          template2.mitigations_status = d.status.title;
          finaldata.push(template2);
        }
      });
    });
    return { finaldata, merges };
  }


  getTemplateVersionUser(width = false) {
    return {
      'top': null,
      ID: null,
      Initiative: null,
      Title: null,
      Description: null,
      'Risk owner': null,
      'Target likelihood': null,
      'Target impact': null,
      'Target Risk Level': null,
      'Current likelihood': null,
      'Current impact': null,
      'Current Risk Level': null,
      Category: null,
      'Created by': null,
      // "Flag to SGD":null,
      'Due Date': null,
      // Redundant: false,
      Mitigations: width ? 'Description' : null,
      mitigations_status: width ? 'Status' : null,
    };
  }



  mapTemplateVersionUser(template, element) {
    template['top'] = element.top == 999 ? '' : element.top;
    template.ID = element.original_risk_id == null ? element.id : element.original_risk_id;
    template.Title = element.title;
    template.Initiative = element.initiative.official_code;
    template.Description = element.description;
    template['Risk owner'] = element.risk_owner?.user?.full_name;
    template['Target likelihood'] = element.target_likelihood;
    template['Target impact'] = element.target_impact;
    template['Target Risk Level'] =
      element.target_likelihood * element.target_impact;
    template['Current likelihood'] = element.current_likelihood;
    template['Current impact'] = element.current_impact;
    template['Current Risk Level'] =
      element.current_likelihood * element.current_impact;
    template.Category = element.category.title;
    template['Created by'] = element.created_by?.full_name;
    template['Due Date'] =
      element.due_date === null
        ? 'null'
        : new Date(element.due_date).toLocaleDateString();
    // template.Redundant = element.redundant;
    // template['Flag to SGD'] = element.flag;
  }



  prepareDataExcelVersionUser(risks) {
    let finaldata = [this.getTemplateVersionUser(true)];
    let merges = [
      {
        s: { c: 15, r: 0 },
        e: { c: 16, r: 0 },
      },
    ];
    for (let index = 0; index < 15; index++) {
      merges.push({
        s: { c: index, r: 0 },
        e: { c: index, r: 1 },
      });
      // console.log(merges[0].s);
    }

    let base = 2;
    risks.forEach((element, indexbase) => {
      const template = this.getTemplateVersionUser();
      this.mapTemplateVersionUser(template, element);
      if (element.mitigations.length) {
        for (let index = 0; index < 15; index++) {
          merges.push({
            s: { c: index, r: base },
            e: { c: index, r: base + element.mitigations.length - 1 },
          });
        }
        base += element.mitigations.length;
      } else {
        finaldata.push(template);
        base += 1;
      }
      element.mitigations.forEach((d, index) => {
        if (index == 0) {
          template.Mitigations = d.description;
          template.mitigations_status = d.status.title;
          finaldata.push(template);
        } else {
          const template2 = this.getTemplateVersionUser();
          template2.Mitigations = d.description;
          template2.mitigations_status = d.status.title;
          finaldata.push(template2);
        }
      });
    });
    return { finaldata, merges };
  }
  @Get(':id')
  @ApiCreatedResponse({
    description: '',
    type: getInitiativeById,
  })
  async getInitiatives(@Param('id') id: number) {
    let asd = await this.iniService.iniRepository
      .findOneOrFail({
        where: { id },
        relations: [
          'risks',
          'risks.category',
          'risks.mitigations',
          'risks.created_by',
          'risks.risk_owner',
          'risks.risk_owner.user',
          'created_by',
          'roles',
          'roles.user',
        ],
        order: { id: 'DESC', risks: { id: 'DESC', top: 'ASC' } },
      })
      .catch((d) => {
        throw new NotFoundException();
      });

    return asd;
  }
  @Get('InitForVersion/:id')
  @ApiCreatedResponse({
    description: '',
    type: getInitiativeById,
  })
  async getInitiativesForVersion(@Param('id') id: number) {
    let result = await this.iniService.iniRepository
      .findOneOrFail({
        where: { id , risks: { redundant: false}},
        relations: [
          'risks',
          'risks.category',
          'risks.mitigations',
          'risks.mitigations.status',
          'risks.created_by',
          'risks.risk_owner',
          'risks.risk_owner.user',
          'created_by',
          'roles',
          'roles.user',
        ],
        // order: { id: 'DESC', risks: { id: 'DESC', top: 'ASC' } },
        order: { risks: { top: 'ASC' } }
      })
      .catch((d) => {
        throw new NotFoundException();
      });

    return result;
  }
  @Get('all/excel')
  @ApiCreatedResponse({
    description: '',
    type: AllExcel,
  })
  async exportAlltoExcel(@Query() userRole: any) {
    let ininit = await this.iniService.iniRepository.find({
      select: ['id'],
      where: { parent_id: IsNull() },
    });
    const risks = await this.riskService.riskRepository.find({
      where: { initiative_id: In(ininit.map((d) => d.id)), redundant: false },
      relations: [
        'initiative',
        'category',
        'created_by',
        'mitigations',
        'mitigations.status',
        'risk_owner',
        'risk_owner.user',
        'initiative.roles',
        'initiative.roles.user',
      ],
      order: { initiative_id: 'ASC' ,top: 'ASC' }
    });
    if (userRole.user == 'admin') {
      const file_name = 'All-Risks-.xlsx';
      var wb = XLSX.utils.book_new();
      const { finaldata, merges } = this.prepareAllDataExcelAdmin(risks);
      const ws = XLSX.utils.json_to_sheet(finaldata);
      ws['!merges'] = merges;

      XLSX.utils.book_append_sheet(wb, ws, 'Risks');
      await XLSX.writeFile(
        wb,
        join(process.cwd(), 'generated_files', file_name),
      );
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
    } else {
      const file_name = 'All-Risks-.xlsx';
      var wb = XLSX.utils.book_new();
      const { finaldata, merges } = this.prepareDataExcelUser(risks);
      const ws = XLSX.utils.json_to_sheet(finaldata);
      ws['!merges'] = merges;

      XLSX.utils.book_append_sheet(wb, ws, 'Risks');
      await XLSX.writeFile(
        wb,
        join(process.cwd(), 'generated_files', file_name),
      );
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

  @Get(':id/excel')
  @ApiCreatedResponse({
    description: '',
    type: getInitiativeById,
  })
  async exportExcel(@Param('id') id: number, @Query() req: any) {
    let init = await this.iniService.iniRepository.findOne({
      where: { id, risks: { redundant: false } },
      relations: [
        'risks',
        'risks.category',
        'risks.created_by',
        'risks.mitigations',
        'risks.mitigations.status',
        'risks.risk_owner',
        'risks.risk_owner.user',
        'roles',
        'roles.user',
        'risks.initiative',
      ],
      order: { risks: { top: 'ASC' } }
    });
    /// merges  Here s = start, r = row, c=col, e= end

    const file_name = init.official_code + '-Risks-' + init.id + '.xlsx';
    var wb = XLSX.utils.book_new();

    const risks = init.risks;

    if (req.user == 'admin' && req.version == 'false') {
      // to be
      const { finaldata, merges } = this.prepareDataExcelAdmin(risks);
      // console.log({ finaldata, merges });
      const ws = XLSX.utils.json_to_sheet(finaldata);
      ws['!merges'] = merges;

      XLSX.utils.book_append_sheet(wb, ws, 'Risks2');
      await XLSX.writeFile(
        wb,
        join(process.cwd(), 'generated_files', file_name),
        { cellStyles: true },
      );
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
    } else if(req.user == 'admin' && req.version == 'true') {
        const { finaldata, merges } = this.prepareDataExcelVersionAdmin(risks);
        // console.log({ finaldata, merges });
        const ws = XLSX.utils.json_to_sheet(finaldata);
        ws['!merges'] = merges;

        XLSX.utils.book_append_sheet(wb, ws, 'Risks2');
        await XLSX.writeFile(
          wb,
          join(process.cwd(), 'generated_files', file_name),
          { cellStyles: true },
        );
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
    else if(req.user == 'user' && req.version == 'false') {
      const { finaldata, merges } = this.prepareDataExcelUser(risks);
      // console.log({ finaldata, merges });
      const ws = XLSX.utils.json_to_sheet(finaldata);
      ws['!merges'] = merges;

      XLSX.utils.book_append_sheet(wb, ws, 'Risks2');
      await XLSX.writeFile(
        wb,
        join(process.cwd(), 'generated_files', file_name),
        { cellStyles: true },
      );
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
  else if(req.user == 'user' && req.version == 'true') {
    const { finaldata, merges } = this.prepareDataExcelVersionUser(risks);
    // console.log({ finaldata, merges });
    const ws = XLSX.utils.json_to_sheet(finaldata);
    ws['!merges'] = merges;

    XLSX.utils.book_append_sheet(wb, ws, 'Risks2');
    await XLSX.writeFile(
      wb,
      join(process.cwd(), 'generated_files', file_name),
      { cellStyles: true },
    );
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

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.Admin,Role.User)
  @Post(':initiative_id/create_version')
  @ApiCreatedResponse({
    description: '',
    type: createVersion,
  })
  @ApiBody({type : reqBodyCreateVersion})
  createVersion(
    @Param('initiative_id') id: number,
    @Body('top') top: any,
    @Req() req,
  ): Promise<Initiative> {
    return this.iniService.createINIT(id, req.user, top);
  }
  @Get('all/categories')
  @ApiCreatedResponse({
    description: '',
    type: getAllCategories,
  })
  getAllCategories() {
    return this.dataSource
      .createQueryBuilder()
      .from('initiative', 'initiative')
      .distinct(true)
      .addSelect('risk_category.id', 'id')
      .addSelect('risk_category.title', 'title')
      .addSelect('risk_category.description', 'description')
      .addSelect('risk_category.disabled', 'disabled')
      .innerJoin('risk', 'risk', 'initiative.id = risk.initiative_id')
      .innerJoin(
        'risk_category',
        'risk_category',
        'risk_category.id = risk.category_id',
      )
      .orderBy('risk_category.title', 'ASC')
      .execute();
  }

  @Get(':id/categories')
  @ApiCreatedResponse({
    description: '',
    type: getAllCategories,
  })
  getCategories(@Param('id') id: number) {
    return this.dataSource
      .createQueryBuilder()
      .from('initiative', 'initiative')
      .distinct(true)
      .addSelect('risk_category.id', 'id')
      .addSelect('risk_category.title', 'title')
      .addSelect('risk_category.description', 'description')
      .addSelect('risk_category.disabled', 'disabled')
      .innerJoin('risk', 'risk', 'initiative.id = risk.initiative_id')
      .innerJoin(
        'risk_category',
        'risk_category',
        'risk_category.id = risk.category_id',
      )
      .where('initiative.id = :id', { id })
      .orderBy('risk_category.title', 'ASC')
      .execute();
  }

  @Get(':id/versions')
  @ApiCreatedResponse({
    description: '',
    type: [getAllVersions],
  })
  getVersons(@Param('id') id: number) {
    return this.iniService.iniRepository.find({
      where: { parent_id: id },
      relations: [
        'risks',
        'risks.category',
        'risks.risk_owner',
        'roles',
        'roles.user',
        'created_by',
      ],
      order: { id: 'DESC', risks: { id: 'DESC', top: 'ASC' } },
    });
  }

  @Get(':id/versions/latest')
  @ApiCreatedResponse({
    description: '',
    type: getAllVersions,
  })
  getLatestVersons(@Param('id') id: number) {
    return this.iniService.iniRepository.findOne({
      where: { parent_id: id },
      relations: [
        'risks',
        'risks.category',
        'risks.risk_owner',
        'roles',
        'roles.user',
        'created_by',
      ],
      order: { id: 'DESC', risks: { id: 'DESC', top: 'ASC' } },
    });
  }

  @Get(':id/roles')
  @ApiCreatedResponse({
    description: '',
    type: [getRoles],
  })
  getRoles(@Param('id') id: number): Promise<InitiativeRoles[]> {
    return this.iniService.iniRolesRepository.find({
      where: { initiative_id: id },
      relations: ['user'],
    });
  }
  @UseGuards(RolesGuard)
  @Roles(Role.Admin,Role.User)
  @Post(':initiative_id/roles')
  @ApiCreatedResponse({
    description: '',
    type: createRoleRes,
  })
  @ApiBody({
    type: createRoleReq,
  })
  @ApiParam({
    name: 'initiative_id',
    type: 'string',
  })
  setRoles(
    @Param('initiative_id') initiative_id: number,
    @Body() initiativeRoles: InitiativeRoles,
  ) {
    return this.iniService.setRole(initiative_id, initiativeRoles);
  }

  @Put(':initiative_id/roles/:initiative_roles_id')
  @ApiCreatedResponse({
    description: '',
    type: updateRoleRes,
  })
  @ApiBody({
    type: updateRoleReq,
  })
  updateMitigation(
    @Body() roles: InitiativeRoles,
    @Param('initiative_id') initiative_id: number,
    @Param('initiative_roles_id') initiative_roles_id: number,
  ) {
    return this.iniService.updateRoles(
      initiative_id,
      initiative_roles_id,
      roles,
    );
  }

  @Delete(':initiative_id/roles/:initiative_roles_id')
  @ApiCreatedResponse({
    description: '',
    type: deleteRoleRes,
  })
  deleteRoles(
    @Param('initiative_id') initiative_id: number,
    @Param('initiative_roles_id') initiative_roles_id: number,
  ) {
    return this.iniService.deleteRole(initiative_id, initiative_roles_id);
  }

  @Get(':id/top')
  @ApiCreatedResponse({
    description: '',
    type: TopSimilar
  })
  async top(@Param('id') id: number) {
    const top_5 = await this.riskService.riskRepository.find({
      where: { initiative_id: id, redundant: false },
      order: { current_level: 'DESC' },
      take: 5,
    });

    const current_impact = top_5.map((d) => d.current_level);
    const current_ids = top_5.map((d) => d.id);

    const similar = await this.riskService.riskRepository.find({
      where: {
        initiative_id: id,
        current_level: In(current_impact),
        id: Not(In(current_ids)),
        redundant: false,
      },
      order: { current_level: 'DESC' },
      take: 5,
    });
    // const top_5 = all_risks.slice(0,4)
    const similar1 = [
      ...similar,
      ...top_5.filter((d) =>
        similar.map((d) => d.current_level).includes(d.current_level),
      ),
    ];

    const top = await this.riskService.riskRepository.find({
      where: {
        initiative_id: id,
        id: Not(In(similar1.map((d) => d.id))),
        current_level: MoreThan(similar1[0] ? similar1[0].current_level : 0),
        redundant: false,
      },
      order: { current_level: 'DESC' },
      take: 5,
    });
    return { top, similar: similar1 };
  }
}
