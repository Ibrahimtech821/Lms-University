<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    protected $table='courses';
    protected $guarded = ['id'];

    public function slides(): HasMany
    {
        return $this->hasMany(Slide::class,"slides","course_id");
    }


}
